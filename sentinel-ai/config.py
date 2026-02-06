import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("SUPABASE_DB_URL")
AI_VERSION = "v1.0"

WEIGHTS = {
    "statistical": 0.30,
    "behavioral": 0.25,
    "cross_patient": 0.25,
    "peer_deviation": 0.20
}
