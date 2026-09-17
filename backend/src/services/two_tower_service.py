import torch
import torch.nn as nn
import torch.nn.functional as F
import pandas as pd

class PlayerTower(nn.Module):
    def __init__(self, input_dim, embedding_dim):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, embedding_dim)
        )

    def forward(self, x):
        return F.normalize(self.network(x), dim=1)


class QueryTower(nn.Module):
    def __init__(self, input_dim, embedding_dim):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Linear(32, embedding_dim)
        )

    def forward(self, x):
        return F.normalize(self.network(x), dim=1)

checkpoint = torch.load("backend/models/two_tower.pt",map_location="cpu",weights_only=False)

input_dim = checkpoint["input_dim"]
embedding_dim = checkpoint["embedding_dim"]

feature_cols = checkpoint["feature_cols"]
scaler = checkpoint["scaler"]

player_tower = PlayerTower(input_dim,embedding_dim)
query_tower = QueryTower(input_dim,embedding_dim)
player_tower.load_state_dict(checkpoint["player_state"])

query_tower.load_state_dict(checkpoint["query_state"])

player_tower.eval()
query_tower.eval()

df = pd.read_csv("backend/data/raw/male_players.csv", low_memory=False)

X = df[feature_cols].fillna(0).astype("float32")
X_scaled = scaler.transform(X)
X_tensor = torch.tensor(X_scaled,dtype=torch.float32)

with torch.no_grad():
    player_embeddings = player_tower(X_tensor)

print("Model loaded!")
print(player_embeddings.shape)

def recommend_players(preferences, top_k=5):
    query = []
    for feature in feature_cols:
        if feature in preferences:
            query.append(preferences[feature])
        else:
            query.append(df[feature].mean())

    query = scaler.transform([query])
    query_tensor = torch.tensor(query, dtype=torch.float32)

    with torch.no_grad():
        query_embedding = query_tower(query_tensor)
        scores = query_embedding @ player_embeddings.T

    indices = torch.topk(scores[0], min(top_k, len(df))).indices
    results = []
    for index in indices:
        index = index.item()
        results.append({
            "name": df.iloc[index]["long_name"],
            "score": scores[0][index].item()
        })

    return results