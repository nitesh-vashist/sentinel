import psycopg2
import pandas as pd
from config import DB_URL

def get_connection():
    return psycopg2.connect(DB_URL)

def fetch_active_trials():
    query = """
        SELECT id
        FROM trials
        WHERE status = 'active'
    """
    df = pd.read_sql(query, get_connection())
    return df["id"].tolist()


def fetch_locked_visits(trial_id):
    query = """
    SELECT
        v.id AS visit_id,
        v.hospital_id,
        v.patient_id,
        v.visit_date,
        v.created_at,
        vv.crf_field_id,
        vv.value_number
    FROM visits v
    JOIN visit_values vv ON v.id = vv.visit_id
    WHERE v.trial_id = %s
      AND v.status = 'locked'
      AND vv.value_number IS NOT NULL
    """
    return pd.read_sql(query, get_connection(), params=[trial_id])
