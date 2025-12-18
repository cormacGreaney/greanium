import json
from flask import Blueprint, jsonify
from backend import config
import os

portfolio_bp = Blueprint("portfolio", __name__)
PORTFOLIO_FILE = os.path.join(config.DATA_DIR, "portfolio.json")

@portfolio_bp.route("/", methods=["GET"])
def get_portfolio():
    try:
        with open(PORTFOLIO_FILE, "r", encoding="utf-8") as f:
            portfolio = json.load(f)
    except FileNotFoundError:
        portfolio = {"error": "Portfolio data not found"}
    return jsonify(portfolio)

@portfolio_bp.route("/projects", methods=["GET"])
def get_projects():
    try:
        with open(PORTFOLIO_FILE, "r", encoding="utf-8") as f:
            portfolio = json.load(f)
        return jsonify({"projects": portfolio.get("projects", [])})
    except FileNotFoundError:
        return jsonify({"projects": []})

@portfolio_bp.route("/bio", methods=["GET"])
def get_bio():
    try:
        with open(PORTFOLIO_FILE, "r", encoding="utf-8") as f:
            portfolio = json.load(f)
        return jsonify(portfolio.get("bio", {}))
    except FileNotFoundError:
        return jsonify({})

