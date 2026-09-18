import pandas as pd
from flask import Blueprint, jsonify, request
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from ..services.player_services import df, feature_cols

player_bp = Blueprint("player", __name__, url_prefix="/api/players")

X = df[feature_cols].fillna(0).astype("float32").values


@player_bp.route("/search", methods=["GET"])
def search_players():
    query = request.args.get("q", "").strip().lower()
    limit = request.args.get("limit", 8, type=int)

    if len(query) < 2:
        return jsonify([])

    mask = (
        df["short_name"].str.lower().str.contains(query, na=False, regex=False)
        | df["long_name"].str.lower().str.contains(query, na=False, regex=False)
    )
    matches = df[mask].drop_duplicates(subset="player_id")
    matches = matches.sort_values("overall", ascending=False).head(limit)

    return jsonify([
        {
            "player_id": int(row["player_id"]),
            "short_name": row["short_name"],
            "long_name": row["long_name"],
            "club_name": row["club_name"] if pd.notna(row["club_name"]) else None,
            "overall": int(row["overall"]) if pd.notna(row["overall"]) else None,
        }
        for _, row in matches.iterrows()
    ])


@player_bp.route("/similar", methods=["POST"])
def similar_players():
    data = request.get_json(force=True) or {}
    name = data.get("player_name")
    top_k = data.get("top_k", 10)

    if not name:
        return jsonify({"error": "player_name is required"}), 400

    name = name.lower()
    matches = df.index[
        (df["long_name"].str.lower() == name)
        | (df["short_name"].str.lower() == name)
    ]
    if len(matches) == 0:
        return jsonify({"error": "Player not found"}), 404

    idx = matches[0]
    sims = cosine_similarity(X[idx].reshape(1, -1), X)[0]
    indices = np.argsort(sims)[::-1]
    indices = indices[indices != idx][:top_k]

    return jsonify([
        {
            "name": df.iloc[i]["long_name"],
            "value": df.iloc[i]["value_eur"],
            "similarity": float(sims[i]),
            "wage_eur": df.iloc[i]["wage_eur"],
            "club_name": df.iloc[i]["club_name"],
            "league_name": df.iloc[i]["league_name"],
        }
        for i in indices
    ])