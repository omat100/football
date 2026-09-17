from flask import Blueprint, jsonify, request
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from ..services.player_services import df, feature_cols

player_bp = Blueprint("player", __name__, url_prefix="/api/players")

X = df[feature_cols].fillna(0).astype("float32").values


@player_bp.route("/similar", methods=["POST"])
def similar_players():
    data = request.get_json()
    name = data.get("player_name")
    top_k = data.get("top_k", 10)

    matches = df.index[df["long_name"].str.lower() == name.lower()]
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