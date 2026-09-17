from flask import Blueprint, request, jsonify

from ..services.two_tower_service import df, feature_cols, recommend_players
scout_bp = Blueprint("scout", __name__, url_prefix="/api/scout")


@scout_bp.route("/", methods=["POST"])
def scout():

    data = request.get_json()

    preferences = data.get("preferences", {})
    top_k = data.get("top_k", 10)

    if not isinstance(preferences, dict):
        return jsonify({"error": "Preferences must be an object"}), 400

    if not isinstance(top_k, int) or top_k < 1:
        return jsonify({"error": "top_k must be a positive integer"}), 400

    results = recommend_players(preferences, top_k)

    for player in results:
        index = df.index[df["long_name"] == player["name"]][0]
        player["position"] = df.iloc[index]["player_positions"]
        player["score"] = round(player["score"], 4)
    return jsonify(results)