import json
from flask import Blueprint, jsonify
from backend import config

links_bp = Blueprint("links", __name__)

@links_bp.route("/", methods=["GET"])
def get_links():
    try:
        with open(config.LINKS_FILE, "r") as f:
            links = json.load(f)
    except FileNotFoundError:
        links = []
    return jsonify(links)
