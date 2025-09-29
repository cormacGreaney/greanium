import os
from flask import Blueprint, jsonify, send_from_directory
from backend import config

files_bp = Blueprint("files", __name__)

@files_bp.route("/", methods=["GET"])
def list_files():
    try:
        files = os.listdir(config.FILES_DIR)
    except FileNotFoundError:
        files = []
    return jsonify({"files": files})

@files_bp.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    return send_from_directory(config.FILES_DIR, filename, as_attachment=True)
