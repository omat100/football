from flask import Blueprint, jsonify, request

from ..services import image_service

image_bp = Blueprint("images", __name__, url_prefix="/api/images")

MAX_ITEMS = 50


@image_bp.route("/resolve", methods=["POST"])
def resolve_images():
    body = request.get_json(force=True) or {}
    clubs = (body.get("clubs") or [])[:MAX_ITEMS]
    leagues = (body.get("leagues") or [])[:MAX_ITEMS]
    players = (body.get("players") or [])[:MAX_ITEMS]

    result = image_service.resolve_batch(clubs, leagues, players)
    return jsonify(result)
