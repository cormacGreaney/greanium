from flask import Blueprint, request, jsonify
from backend import config

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if data.get("username") == config.USERNAME and data.get("password") == config.PASSWORD:
        return jsonify({"status": "ok"})
    return jsonify({"status": "fail"}), 401
