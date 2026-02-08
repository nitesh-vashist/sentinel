from db import fetch_locked_visits

from features.statistical import extract_statistical_features
from detectors.statistical import (
    build_trial_baseline,
    detect_statistical_anomalies
)

from features.behavioral import extract_behavioral_features
from detectors.behavioral import (
    build_behavioral_baseline,
    detect_behavioral_anomalies
)



from persistence.writer import (
    create_ai_run,
    save_hospital_scores,
    save_anomaly_signals,
    finalize_ai_run
)

from features.cross_patient import extract_cross_patient_features
from detectors.cross_patient import detect_cross_patient_templating

from features.cross_hospital import extract_cross_hospital_features
from detectors.cross_hospital import detect_cross_hospital_deviation

def run_ai_for_trial(trial_id, triggered_by=None):
    # 1. Fetch immutable data
    df = fetch_locked_visits(trial_id)

    if df.empty:
        print("No locked visits found.")
        return

    # 2. Create AI run
    ai_run_id = create_ai_run(
        trial_id=trial_id,
        ai_version="v1.0",
        trigger_type="manual",
        triggered_by=triggered_by,
        notes="Task 1 + Task 2 analysis"
    )

    print(f"AI run started: {ai_run_id}")

    try:
        # -----------------------------
        # Task 1: Statistical anomalies
        # -----------------------------
        stat_features = extract_statistical_features(df)
        stat_baseline = build_trial_baseline(stat_features)
        task1_results = detect_statistical_anomalies(
            stat_features, stat_baseline
        )

        # -----------------------------
        # Task 2: Behavioral anomalies
        # -----------------------------
        behavioral_features = extract_behavioral_features(df)

        # if behavioral_features:
        #     behavioral_baseline = build_behavioral_baseline(
        #         behavioral_features
        #     )
        #     task2_results = detect_behavioral_anomalies(
        #         behavioral_features,
        #         behavioral_baseline
        #     )
        # else:
        #     task2_results = {}

        # behavioral_baseline = build_behavioral_baseline(behavioral_features)
        # task2_results = detect_behavioral_anomalies(
        #     behavioral_features,
        #     behavioral_baseline
        # )

        behavioral_baseline = build_behavioral_baseline(behavioral_features)

        task2_results = detect_behavioral_anomalies(
            behavioral_features,
            baseline=behavioral_baseline,
            trial_phase="PHASE_3"
        )



        print("DEBUG TASK 2 RAW OUTPUT:")
        for k, v in task2_results.items():
            print(k, v)


        # -----------------------------
        # Task 3: Cross-patient templating (in-memory only)
        # -----------------------------
        cross_patient_features = extract_cross_patient_features(df)

        if cross_patient_features:
            task3_results = detect_cross_patient_templating(cross_patient_features)
        else:
            task3_results = {}


        # -----------------------------
        # Task 4: Cross-hospital deviation
        # -----------------------------
        cross_hospital_features = extract_cross_hospital_features(
            task1_results,
            task2_results,
            task3_results
        )

        task4_results = detect_cross_hospital_deviation(cross_hospital_features)


        # -----------------------------
        # Merge + Persist
        # -----------------------------
        all_hospital_ids = (
            set(task1_results.keys())
            | set(task2_results.keys())
            | set(task3_results.keys())
        )

        for hospital_id in all_hospital_ids:
            stat = task1_results.get(hospital_id, {})
            beh = task2_results.get(hospital_id, {})

            cp = task3_results.get(hospital_id, {})

            peer = task4_results.get(hospital_id, {})
            

            statistical_score = float(stat.get("statistical_score", 0.0))
            behavioral_score = float(beh.get("behavioral_score", 0.0))
            
            cross_patient_score = float(cp.get("cross_patient_score", 0.0))
            peer_deviation_score = float(peer.get("peer_deviation_score", 0.0))
            

            scores = {
                "statistical": statistical_score,
                "behavioral": behavioral_score,
                "cross_patient": cross_patient_score,
                "peer_deviation": peer_deviation_score
            }

            # scoring system

            WEIGHTS = {
                "statistical": 0.20,
                "behavioral": 0.20,
                "cross_patient": 0.30,
                "peer_deviation": 0.30
            }

            weighted_score = (
                WEIGHTS["statistical"] * statistical_score +
                WEIGHTS["behavioral"] * behavioral_score +
                WEIGHTS["cross_patient"] * cross_patient_score +
                WEIGHTS["peer_deviation"] * peer_deviation_score
            )

            risk_score = round(weighted_score * 100, 2)

            if risk_score < 30:
                risk_level = "LOW"
            elif risk_score < 60:
                risk_level = "MEDIUM"
            else:
                risk_level = "HIGH"

            # Save hospital scores
            save_hospital_scores(
                ai_run_id=ai_run_id,
                trial_id=trial_id,
                hospital_id=hospital_id,
                scores=scores,
                risk_score=risk_score,
                risk_level=risk_level
            )

            # Collect anomaly signals
            db_signals = []

            for sig in stat.get("signals", []):
                db_signals.append({
                    "type": "statistical_abnormality",
                    "key": "statistical_outlier",
                    "field": sig["field_id"],
                    "score": float(sig["score"]),
                    "explanation": sig["reason"]
                })

            for sig in beh.get("signals", []):
                db_signals.append({
                    "type": "behavioral_anomaly",
                    "key": "behavioral_pattern",
                    "field": None,
                    "score": float(sig["score"]),
                    "explanation": sig["reason"]
                })

            for sig in cp.get("signals", []):
                db_signals.append({
                    "type": "cross_patient_similarity",
                    "key": "patient_templating",
                    "field": None,
                    "score": float(sig["score"]),
                    "explanation": sig["reason"]
                })

            for sig in peer.get("signals", []):
                db_signals.append({
                    "type": "peer_deviation",
                    "key": "hospital_peer_outlier",
                    "field": None,
                    "score": float(sig["score"]),
                    "explanation": sig["reason"]
                })


            save_anomaly_signals(
                ai_run_id=ai_run_id,
                trial_id=trial_id,
                hospital_id=hospital_id,
                signals=db_signals
            )

            # Debug print
            print(f"\nHospital: {hospital_id}")
            print("Scores:", scores)
            if db_signals:
                print("Signals:")
                for s in db_signals:
                    print(" -", s)
            else:
                print("Signals: None")

        # 5. Finalize run
        finalize_ai_run(ai_run_id, status="completed")
        print("AI run completed successfully.")

    except Exception as e:
        finalize_ai_run(ai_run_id, status="failed")
        print("AI run failed:", str(e))
        raise
