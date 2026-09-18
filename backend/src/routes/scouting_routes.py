# scouting_routes.py
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from flask import Blueprint, request, jsonify

scouting_bp = Blueprint('scouting', __name__, url_prefix='/api/scouting')

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ---- Model classes (same as training) ----
EMB_DIM = 64
POS_EMB_DIM = 16

class PlayerTower(nn.Module):
    def __init__(self, num_attrs, num_positions, pos_emb_dim=POS_EMB_DIM, emb_dim=EMB_DIM):
        super().__init__()
        self.pos_emb = nn.Embedding(num_positions, pos_emb_dim)
        self.net = nn.Sequential(
            nn.Linear(num_attrs + pos_emb_dim, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, emb_dim),
        )
    def forward(self, stats, pos_idx):
        pos_e = self.pos_emb(pos_idx)
        x = torch.cat([stats, pos_e], dim=-1)
        return F.normalize(self.net(x), dim=-1)

class QueryTower(nn.Module):
    def __init__(self, num_attrs, num_positions, pos_emb_dim=POS_EMB_DIM, emb_dim=EMB_DIM):
        super().__init__()
        self.pos_emb = nn.Embedding(num_positions, pos_emb_dim)
        self.no_pos_emb = nn.Parameter(torch.zeros(pos_emb_dim))
        self.net = nn.Sequential(
            nn.Linear(num_attrs * 2 + pos_emb_dim, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, emb_dim),
        )
    def forward(self, target, weight, pos_idx, pos_mask):
        pos_e = self.pos_emb(pos_idx)
        pos_e = pos_e * pos_mask.unsqueeze(-1) + self.no_pos_emb * (1 - pos_mask.unsqueeze(-1))
        x = torch.cat([target * weight, weight, pos_e], dim=-1)
        return F.normalize(self.net(x), dim=-1)

ckpt = torch.load('backend/models/two_tower_scout.pt', map_location=device)
pos2idx = ckpt['pos2idx']
stat_min = pd.Series(ckpt['stat_min'])
stat_max = pd.Series(ckpt['stat_max'])
NUM_COLS = ckpt['num_cols']
CORE_STATS = ckpt['core_stats']
NUM_ATTRS = ckpt['num_attrs']
NUM_POSITIONS = ckpt['num_positions']

query_tower = QueryTower(NUM_ATTRS, NUM_POSITIONS).to(device)
full_state = ckpt['model_state_dict']
query_tower.load_state_dict({k.replace('query_tower.', ''): v for k, v in full_state.items() if k.startswith('query_tower.')})
query_tower.eval()

emb_df = pd.read_csv('backend/notebooks/player_embeddings.csv')
emb_cols = [c for c in emb_df.columns if c.startswith('emb_')]
all_player_emb = torch.tensor(emb_df[emb_cols].values, dtype=torch.float32).to(device)
all_player_emb = F.normalize(all_player_emb, dim=-1)

# ---- Route ----
@scouting_bp.route('/', methods=['POST'])
def scout_search_endpoint():
    body = request.get_json(force=True)
    desired = body.get('desired', {})
    position = body.get('position')
    top_k = int(body.get('top_k', 10))

    target = np.zeros(NUM_ATTRS, dtype=np.float32)
    weight = np.zeros(NUM_ATTRS, dtype=np.float32)
    for attr, val in desired.items():
        if attr not in NUM_COLS:
            continue
        i = NUM_COLS.index(attr)
        norm_val = (val - stat_min[attr]) / (stat_max[attr] - stat_min[attr] + 1e-8)
        target[i] = norm_val
        weight[i] = 1.0

    pos_mask = 1.0 if position else 0.0
    pos_idx = pos2idx.get(position, 0) if position else 0

    with torch.no_grad():
        q_target = torch.tensor(target).unsqueeze(0).to(device)
        q_weight = torch.tensor(weight).unsqueeze(0).to(device)
        q_pos = torch.tensor([pos_idx], dtype=torch.long).to(device)
        q_mask = torch.tensor([pos_mask]).to(device)
        query_emb = query_tower(q_target, q_weight, q_pos, q_mask)

        sims = (query_emb @ all_player_emb.T).squeeze(0)
        top_idx = torch.topk(sims, min(top_k, sims.size(0))).indices.cpu().numpy()

    results = emb_df.iloc[top_idx][['player_id', 'short_name', 'primary_position', 'overall', 'age'] + CORE_STATS].copy()
    results['similarity'] = sims[top_idx].cpu().numpy()
    return jsonify(results.to_dict(orient='records'))