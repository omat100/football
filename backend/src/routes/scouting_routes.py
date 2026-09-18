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

# Original player dataset containing club, league, value and wage
players_df = pd.read_csv('backend/notebooks/players_clean.csv', low_memory=False)

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

    metadata_cols = [
        'player_id',
        'long_name',
        'club_name',
        'league_name',
        'value_eur',
        'wage_eur',
        'height_cm'
    ]

    metadata = players_df[metadata_cols].drop_duplicates(subset='player_id')

    results = results.merge(
        metadata,
        on='player_id',
        how='left'
    )

    results['similarity'] = sims[top_idx].cpu().numpy()
    return jsonify(results.to_dict(orient='records'))

# add to scouting_routes.py

@scouting_bp.route('/compare', methods=['POST'])
def compare_players_endpoint():
    body = request.get_json(force=True)
    identifiers = body.get('players', [])  # now accepts names OR ids

    if len(identifiers) < 2:
        return jsonify({"error": "Provide at least 2 players (name or player_id)"}), 400

    resolved_ids = []
    errors = []

    for ident in identifiers:
        # try as player_id first (int or numeric string)
        if isinstance(ident, int) or (isinstance(ident, str) and ident.isdigit()):
            pid = int(ident)
            match = emb_df[emb_df['player_id'] == pid]
        else:
            # name lookup — case-insensitive exact match first
            match = emb_df[emb_df['short_name'].str.lower() == str(ident).lower()]
            if match.empty:
                # fallback: contains match (handles partial names)
                match = emb_df[emb_df['short_name'].str.lower().str.contains(str(ident).lower(), na=False)]

        if match.empty:
            errors.append(f"No player found for '{ident}'")
        elif len(match) > 1:
            options = match['short_name'].tolist()[:5]
            errors.append(f"'{ident}' is ambiguous, matches: {options}. Use player_id instead.")
        else:
            resolved_ids.append(int(match.iloc[0]['player_id']))

    if errors:
        return jsonify({"error": errors}), 404

    # --- rest is same as before, using resolved_ids instead of player_ids ---
    rows = emb_df[emb_df['player_id'].isin(resolved_ids)]
    rows = rows.set_index('player_id').loc[resolved_ids].reset_index()

    display_cols = ['player_id', 'short_name', 'primary_position', 'overall', 'age'] + CORE_STATS
    stats_table = rows[display_cols].to_dict(orient='records')

    embs = torch.tensor(rows[emb_cols].values, dtype=torch.float32).to(device)
    embs = F.normalize(embs, dim=-1)
    sim_matrix = (embs @ embs.T).cpu().numpy()

    pairwise_similarity = []
    for i in range(len(resolved_ids)):
        for j in range(i + 1, len(resolved_ids)):
            pairwise_similarity.append({
                "player_a": rows.iloc[i]['short_name'],
                "player_b": rows.iloc[j]['short_name'],
                "similarity": float(sim_matrix[i][j])
            })

    biggest_differences = None
    if len(resolved_ids) == 2:
        diffs = {}
        for stat in CORE_STATS + ['overall', 'age']:
            v1, v2 = rows.iloc[0][stat], rows.iloc[1][stat]
            diffs[stat] = float(v1 - v2)
        biggest_differences = dict(sorted(diffs.items(), key=lambda x: -abs(x[1])))

    return jsonify({
        "players": stats_table,
        "pairwise_similarity": pairwise_similarity,
        "biggest_differences": biggest_differences
    })

@scouting_bp.route('/pricing/<int:player_id>', methods=['GET'])
def player_pricing_endpoint(player_id):
    k = int(request.args.get('k', 15))

    target_row = emb_df[emb_df['player_id'] == player_id]
    if target_row.empty:
        return jsonify({"error": f"player_id {player_id} not found"}), 404

    target_idx = target_row.index[0]
    target_emb = torch.tensor(target_row[emb_cols].values, dtype=torch.float32).to(device)
    target_emb = F.normalize(target_emb, dim=-1)

    sims = (target_emb @ all_player_emb.T).squeeze(0)
    sims[target_idx] = -1  # exclude self
    top_sim, top_idx = torch.topk(sims, k)

    neighbors = emb_df.iloc[top_idx.cpu().numpy()].copy()
    neighbors = neighbors[neighbors['value_eur'].notna() & (neighbors['value_eur'] > 0)]

    if neighbors.empty:
        return jsonify({"error": "No comparable priced players found"}), 404

    weights = top_sim.cpu().numpy()[:len(neighbors)]
    weights = np.clip(weights, 0, None)
    est_value = float(np.average(neighbors['value_eur'], weights=weights))

    actual_value = float(target_row.iloc[0]['value_eur']) if pd.notna(target_row.iloc[0]['value_eur']) else None
    verdict = None
    if actual_value:
        pct_diff = (actual_value - est_value) / est_value * 100
        if pct_diff > 15:
            verdict = "overvalued"
        elif pct_diff < -15:
            verdict = "undervalued"
        else:
            verdict = "fairly valued"

    comparables = neighbors[['player_id', 'short_name', 'primary_position', 'overall', 'value_eur']].copy()
    comparables['similarity'] = weights[:len(comparables)]
    comparables = comparables.sort_values('similarity', ascending=False)

    return jsonify({
        "player_id": player_id,
        "short_name": target_row.iloc[0]['short_name'],
        "actual_value_eur": actual_value,
        "estimated_value_eur": round(est_value, 2),
        "verdict": verdict,
        "value_range": {
            "min": float(neighbors['value_eur'].min()),
            "max": float(neighbors['value_eur'].max())
        },
        "comparables": comparables.to_dict(orient='records')
    })