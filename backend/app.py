from flask import Flask, send_from_directory
from backend.routes.files import files_bp
from backend.routes.links import links_bp
from backend.routes.auth import auth_bp
import os


app = Flask(__name__)

# Register blueprints
app.register_blueprint(files_bp, url_prefix="/files")
app.register_blueprint(links_bp, url_prefix="/links")
app.register_blueprint(auth_bp, url_prefix="/auth")

# Serve frontend
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))

@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
