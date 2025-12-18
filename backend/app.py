from flask import Flask, send_from_directory
from backend.routes.files import files_bp
from backend.routes.links import links_bp
from backend.routes.auth import auth_bp
from backend.routes.portfolio import portfolio_bp
from backend.routes.contact import contact_bp
from backend.routes.github import github_bp
from flask import request
import openai 
import os


app = Flask(__name__)

# Register blueprints
app.register_blueprint(files_bp, url_prefix="/files")
app.register_blueprint(links_bp, url_prefix="/links")
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(portfolio_bp, url_prefix="/portfolio")
app.register_blueprint(contact_bp, url_prefix="/contact")
app.register_blueprint(github_bp, url_prefix="/github")

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


# AI Integration
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/ai", methods=["POST"])
def ai_chat():
    data = request.json
    user_prompt = data.get("prompt", "")

    if not user_prompt:
        return {"error": "No prompt provided"}, 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """You are the Greanium AI, the built-in intelligence of the Greanium OS.  
Greanium is a personal operating system created by Cormac Greaney.  
Your primary role is to assist Cormac with knowledge, explanations, and guidance.  
At the same time, you should also be welcoming and helpful to other people who may occasionally use the system.  

Guidelines:  
- Identify yourself as Greanium AI, the assistant of Greanium OS.  
- Be helpful, clear, and practical.  
- Treat Cormac Greaney as the system’s owner, while also assisting any other users respectfully.  
- Keep responses professional but approachable.  
- If asked about context, explain that you operate inside Greanium OS, a personal web-based OS created by your creator Cormac Greaney.  
"""}, 
                {"role": "user", "content": user_prompt}
            ]
        )
        reply = response["choices"][0]["message"]["content"]
        return {"reply": reply}
    except Exception as e:
        return {"error": str(e)}, 500



