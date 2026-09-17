import pickle
from pathlib import Path

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "player_baseline.pkl"
DATA_PATH = BASE_DIR / "notebooks" / "players_clean.csv"


with open(MODEL_PATH, "rb") as f:
    data = pickle.load(f)

X = data["X"]
feature_cols = data["feature_cols"]
scaler = data["scaler"]

if hasattr(X, "to_numpy"):
    X = X.to_numpy()

df = pd.read_csv(DATA_PATH)


def get_similar_players(player_index: int, top_k: int = 5):
    if player_index < 0 or player_index >= len(X):
        raise IndexError("Invalid player index")

    similarities = cosine_similarity(
        X[player_index].reshape(1, -1),
        X
    )[0]

    indices = similarities.argsort()[::-1]

    results = []

    for index in indices:
        if index == player_index:
            continue

        results.append({
            "player_id": int(df.iloc[index]["player_id"]),
            "name": str(df.iloc[index]["long_name"]),
            "similarity": round(float(similarities[index]), 4)
        })

        if len(results) == top_k:
            break

    return results
