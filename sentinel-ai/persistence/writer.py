import psycopg2
from datetime import datetime
from config import DB_URL


# ---------------------------
# Connection helper
# ---------------------------

def get_conn():
    return psycopg2.connect(DB_URL)


# ---------------------------
# AI RUNS
# ---------------------------

def create_ai_run(
    trial_id,
    ai_version="v1.0",
    trigger_type="manual",
    triggered_by=None,
    notes=None
):
    """
    Creates an AI run entry and returns ai_run_id
    """
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO ai_runs (
            trial_id,
            triggered_by,
            trigger_type,
            ai_version,
            status,
            notes
        )
        VALUES (%s, %s, %s, %s, 'running', %s)
        RETURNING id
        """,
        (trial_id, triggered_by, trigger_type, ai_version, notes)
    )

    ai_run_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return ai_run_id


def finalize_ai_run(ai_run_id, status="completed"):
    """
    Marks AI run as completed or failed
    """
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        UPDATE ai_runs
        SET status = %s,
            completed_at = %s
        WHERE id = %s
        """,
        (status, datetime.utcnow(), ai_run_id)
    )

    conn.commit()
    cur.close()
    conn.close()


def save_hospital_scores(
    ai_run_id,
    trial_id,
    hospital_id,
    scores,
    risk_score,
    risk_level
):
    """
    scores = {
        "statistical": 0.62,
        "behavioral": None,
        "cross_patient": None,
        "peer_deviation": None
    }
    """

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO ai_hospital_scores (
            ai_run_id,
            trial_id,
            hospital_id,
            risk_score,
            risk_level,
            statistical_score,
            behavioral_score,
            cross_patient_score,
            peer_deviation_score
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            ai_run_id,
            trial_id,
            hospital_id,
            risk_score,
            risk_level,
            scores.get("statistical"),
            scores.get("behavioral"),
            scores.get("cross_patient"),
            scores.get("peer_deviation"),
        )
    )

    conn.commit()
    cur.close()
    conn.close()


def save_anomaly_signals(
    ai_run_id,
    trial_id,
    hospital_id,
    signals
):
    """
    signals = [
        {
            "type": "statistical_abnormality",
            "key": "low_variance",
            "field": "bp_sys",
            "score": 0.81,
            "explanation": "Unusually low variance and heavy rounding bias"
        }
    ]
    """

    if not signals:
        return

    conn = get_conn()
    cur = conn.cursor()

    for signal in signals:
        cur.execute(
            """
            INSERT INTO ai_anomaly_signals (
                ai_run_id,
                trial_id,
                hospital_id,
                signal_type,
                signal_key,
                affected_field,
                anomaly_score,
                explanation
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                ai_run_id,
                trial_id,
                hospital_id,
                signal["type"],
                signal["key"],
                signal.get("field"),
                signal["score"],
                signal["explanation"]
            )
        )

    conn.commit()
    cur.close()
    conn.close()
