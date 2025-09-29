import os

# Base paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
FILES_DIR = os.path.join(DATA_DIR, "files")
LINKS_FILE = os.path.join(DATA_DIR, "links.json")

# Auth settings (for now: simple env vars or defaults)
USERNAME = os.getenv("HUB_USER", "admin")
PASSWORD = os.getenv("HUB_PASS", "password")
