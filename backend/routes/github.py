import requests
from flask import Blueprint, jsonify
import os

github_bp = Blueprint("github", __name__)

@github_bp.route("/stats", methods=["GET"])
def get_github_stats():
    """
    Get GitHub statistics for a user.
    Requires GITHUB_USERNAME in environment or uses default.
    """
    username = os.getenv("GITHUB_USERNAME", "cormacGreaney")
    
    try:
        # Get user info
        user_url = f"https://api.github.com/users/{username}"
        user_response = requests.get(user_url, timeout=5)
        
        if user_response.status_code != 200:
            return jsonify({"error": "Failed to fetch GitHub data"}), 500
        
        user_data = user_response.json()
        
        # Get repos
        repos_url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=10"
        repos_response = requests.get(repos_url, timeout=5)
        repos_data = repos_response.json() if repos_response.status_code == 200 else []
        
        # Calculate stats
        total_repos = user_data.get("public_repos", 0)
        total_stars = sum(repo.get("stargazers_count", 0) for repo in repos_data)
        total_forks = sum(repo.get("forks_count", 0) for repo in repos_data)
        
        # Get languages from repos
        languages = {}
        for repo in repos_data[:10]:  # Top 10 repos
            lang_url = repo.get("languages_url")
            if lang_url:
                try:
                    lang_response = requests.get(lang_url, timeout=3)
                    if lang_response.status_code == 200:
                        repo_langs = lang_response.json()
                        for lang, bytes_count in repo_langs.items():
                            languages[lang] = languages.get(lang, 0) + bytes_count
                except:
                    pass
        
        # Sort languages by usage
        top_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return jsonify({
            "username": username,
            "profile_url": user_data.get("html_url"),
            "avatar_url": user_data.get("avatar_url"),
            "bio": user_data.get("bio"),
            "stats": {
                "repositories": total_repos,
                "stars": total_stars,
                "forks": total_forks,
                "followers": user_data.get("followers", 0),
                "following": user_data.get("following", 0)
            },
            "top_languages": [lang[0] for lang in top_languages],
            "recent_repos": [
                {
                    "name": repo.get("name"),
                    "description": repo.get("description"),
                    "url": repo.get("html_url"),
                    "stars": repo.get("stargazers_count", 0),
                    "language": repo.get("language"),
                    "updated_at": repo.get("updated_at")
                }
                for repo in repos_data[:5]
            ]
        })
        
    except Exception as e:
        print(f"Error fetching GitHub data: {e}")
        return jsonify({"error": "Failed to fetch GitHub data"}), 500

