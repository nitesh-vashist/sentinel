# import numpy as np


# # ---------------------------
# # Baseline builder
# # ---------------------------

# def build_behavioral_baseline(features):
#     """
#     Input:
#       features = {
#         hospital_id: {
#           median_delay_days,
#           p90_delay_days,
#           submission_burstiness,
#           same_hour_ratio,
#           weekend_ratio,
#           visit_count
#         }
#       }

#     Output:
#       baseline stats per feature
#     """
#     keys = [
#         "median_delay_days",
#         "p90_delay_days",
#         "submission_burstiness",
#         "same_hour_ratio",
#         "weekend_ratio",
#         "same_day_visit_ratio",
#         "same_day_multi_visit_ratio",
#     ]

#     baseline = {k: [] for k in keys}

#     for h in features.values():
#         for k in keys:
#             baseline[k].append(h[k])

#     # compute mu/sigma with guards
#     stats = {}
#     for k, vals in baseline.items():
#         vals = np.array(vals, dtype=float)
#         stats[k] = {
#             "mu": float(np.mean(vals)),
#             "sigma": float(np.std(vals)) + 1e-6
#         }

#     return stats


# def z_score(value, mu, sigma):
#     return abs(value - mu) / sigma


# # ---------------------------
# # Detector
# # ---------------------------

# def detect_behavioral_anomalies(features, baseline):
#     """
#     Returns:
#     {
#       hospital_id: {
#         "behavioral_score": float,
#         "signals": [
#           {
#             "score": float,
#             "reason": str
#           }
#         ]
#       }
#     }
#     """

#     results = {}

#     for hospital_id, h in features.items():
#         signals = []
#         field_scores = []

#         # 0) Impossible same-day multi-visit per patient (ABSOLUTE)
#         multi_visit_ratio = h.get("same_day_multi_visit_ratio", 0.0)

#         if multi_visit_ratio > 0:
#             signals.append({
#                 "score": 1.0,
#                 "reason": (
#                     f"{int(multi_visit_ratio * 100)}% of patients have multiple visits "
#                     "recorded on the same clinical day, which is protocol-inconsistent."
#                 )
#             })

#             # # ABSOLUTE VIOLATION → override everything else
#             results[hospital_id] = {
#                 "behavioral_score": 1.0,
#                 "signals": signals
#             }
#             continue  # skip remaining behavioral checks for this hospital



#         # 1) Entry delay anomalies
#         z_med = z_score(h["median_delay_days"],
#                         baseline["median_delay_days"]["mu"],
#                         baseline["median_delay_days"]["sigma"])
#         z_p90 = z_score(h["p90_delay_days"],
#                         baseline["p90_delay_days"]["mu"],
#                         baseline["p90_delay_days"]["sigma"])

#         delay_score = min(max(z_med, z_p90) / 3.0, 1.0)
#         if delay_score > 0.6:
#             signals.append({
#                 "score": round(delay_score, 2),
#                 "reason": "Unusually high delay between visit date and data entry"
#             })
#         field_scores.append(delay_score)

#         # 2) Burst submission anomalies (very low variance between submissions)
#         z_burst = z_score(h["submission_burstiness"],
#                           baseline["submission_burstiness"]["mu"],
#                           baseline["submission_burstiness"]["sigma"])

#         burst_score = min(z_burst / 3.0, 1.0)
#         if burst_score > 0.6:
#             signals.append({
#                 "score": round(burst_score, 2),
#                 "reason": "Batch-style submission behavior detected"
#             })
#         field_scores.append(burst_score)

#         # 3) Same-hour concentration
#         # High same-hour ratio is suspicious
#         z_hour = z_score(h["same_hour_ratio"],
#                          baseline["same_hour_ratio"]["mu"],
#                          baseline["same_hour_ratio"]["sigma"])

#         hour_score = min(z_hour / 3.0, 1.0)
#         if hour_score > 0.6 and h["same_hour_ratio"] > 0.4:
#             signals.append({
#                 "score": round(hour_score, 2),
#                 "reason": "Large fraction of visits entered in the same hour"
#             })
#         field_scores.append(hour_score)

#         # 4) Weekend-heavy submissions
#         z_weekend = z_score(h["weekend_ratio"],
#                             baseline["weekend_ratio"]["mu"],
#                             baseline["weekend_ratio"]["sigma"])

#         weekend_score = min(z_weekend / 3.0, 1.0)
#         if weekend_score > 0.6 and h["weekend_ratio"] > 0.4:
#             signals.append({
#                 "score": round(weekend_score, 2),
#                 "reason": "Unusually high proportion of weekend data entry"
#             })
#         field_scores.append(weekend_score)

#         # 5) Same-day visit batching (hospital-level)
#         z_day = z_score(
#             h["same_day_visit_ratio"],
#             baseline["same_day_visit_ratio"]["mu"],
#             baseline["same_day_visit_ratio"]["sigma"]
#         )

#         day_batch_score = min(z_day / 3.0, 1.0)

#         if day_batch_score > 0.6 and h["same_day_visit_ratio"] > 0.4:
#             signals.append({
#                 "score": round(day_batch_score, 2),
#                 "reason": "Large proportion of visits occurred on the same clinical day (hospital-level batching)"
#             })

#         field_scores.append(day_batch_score)


#         # Aggregate hospital behavioral score
#         if field_scores:
#             behavioral_score = round(float(np.mean(field_scores)), 2)
#         else:
#             behavioral_score = 0.0

#         results[hospital_id] = {
#             "behavioral_score": behavioral_score,
#             "signals": signals
#         }

#     return results

import numpy as np


# ---------------------------------
# Trial-phase–aware visit gap rules
# ---------------------------------

VISIT_GAP_RULES = {
    "PHASE_2": {
        "min_gap_days": 3,
        "hard_gap_days": 1
    },
    "PHASE_3": {
        "min_gap_days": 7,
        "hard_gap_days": 1
    }
}



def build_behavioral_baseline(features):
    """
    Builds baseline stats for heuristic behavioral checks.
    Absolute rules do NOT depend on this.
    """

    keys = [
        "median_delay_days",
        "p90_delay_days",
        "submission_burstiness",
        "same_hour_ratio",
        "weekend_ratio",
        "same_day_visit_ratio",
    ]

    baseline = {k: [] for k in keys}

    for h in features.values():
        for k in keys:
            baseline[k].append(h.get(k, 0.0))

    stats = {}
    for k, vals in baseline.items():
        vals = np.array(vals, dtype=float)
        stats[k] = {
            "mu": float(np.mean(vals)),
            "sigma": float(np.std(vals)) + 1e-6
        }

    return stats

def detect_behavioral_anomalies(features, baseline=None, trial_phase="PHASE_3"):
    """
    Behavioral anomaly detection with:
    - Absolute protocol rules (highest priority)
    - Heuristic / statistical behavioral rules
    - Severity levels: CRITICAL / MAJOR / MINOR
    """

    results = {}

    rules = VISIT_GAP_RULES.get(trial_phase, VISIT_GAP_RULES["PHASE_3"])
    MIN_GAP = rules["min_gap_days"]
    HARD_GAP = rules["hard_gap_days"]

    for hospital_id, h in features.items():
        signals = []
        field_scores = []

        # =====================================================
        # 1️⃣ ABSOLUTE: Patient visit gap violations
        # =====================================================
        short_gap_ratio = h.get("short_gap_ratio", 0.0)
        hard_violations = h.get("hard_gap_violations", 0)

        # --- CRITICAL: < 24 hours ---
        if hard_violations > 0:
            signals.append({
                "severity": "CRITICAL",
                "score": 1.0,
                "reason": (
                    "One or more patient visits occurred less than 24 hours apart, "
                    f"which is clinically implausible in {trial_phase.replace('_', ' ')} trials."
                )
            })

            results[hospital_id] = {
                "behavioral_score": 1.0,
                "signals": signals
            }
            continue  # hard stop

        # --- MAJOR: < protocol minimum (e.g., 7 days) ---
        if short_gap_ratio > 0:
            score = min(1.0, round(short_gap_ratio * 1.5, 2))
            signals.append({
                "severity": "MAJOR",
                "score": score,
                "reason": (
                    f"{int(short_gap_ratio * 100)}% of patient visit intervals are "
                    f"shorter than {MIN_GAP} days, indicating abnormal visit scheduling."
                )
            })
            field_scores.append(score)

        # =====================================================
        # 2️⃣ HEURISTIC / STATISTICAL BEHAVIORAL CHECKS
        # (only if no CRITICAL violation)
        # =====================================================

        if baseline:
            # Entry delay anomalies
            z_med = abs(
                h["median_delay_days"] - baseline["median_delay_days"]["mu"]
            ) / baseline["median_delay_days"]["sigma"]

            z_p90 = abs(
                h["p90_delay_days"] - baseline["p90_delay_days"]["mu"]
            ) / baseline["p90_delay_days"]["sigma"]

            delay_score = min(max(z_med, z_p90) / 3.0, 1.0)
            if delay_score > 0.6:
                signals.append({
                    "severity": "MINOR",
                    "score": round(delay_score, 2),
                    "reason": "Unusually high delay between visit date and data entry"
                })
            field_scores.append(delay_score)

            # Burst submissions
            z_burst = abs(
                h["submission_burstiness"] - baseline["submission_burstiness"]["mu"]
            ) / baseline["submission_burstiness"]["sigma"]

            burst_score = min(z_burst / 3.0, 1.0)
            if burst_score > 0.6:
                signals.append({
                    "severity": "MINOR",
                    "score": round(burst_score, 2),
                    "reason": "Batch-style submission behavior detected"
                })
            field_scores.append(burst_score)

            # Same-hour concentration
            z_hour = abs(
                h["same_hour_ratio"] - baseline["same_hour_ratio"]["mu"]
            ) / baseline["same_hour_ratio"]["sigma"]

            hour_score = min(z_hour / 3.0, 1.0)
            if hour_score > 0.6 and h["same_hour_ratio"] > 0.4:
                signals.append({
                    "severity": "MINOR",
                    "score": round(hour_score, 2),
                    "reason": "Large fraction of visits entered in the same hour"
                })
            field_scores.append(hour_score)

            # Weekend-heavy submissions
            z_weekend = abs(
                h["weekend_ratio"] - baseline["weekend_ratio"]["mu"]
            ) / baseline["weekend_ratio"]["sigma"]

            weekend_score = min(z_weekend / 3.0, 1.0)
            if weekend_score > 0.6 and h["weekend_ratio"] > 0.4:
                signals.append({
                    "severity": "MINOR",
                    "score": round(weekend_score, 2),
                    "reason": "Unusually high proportion of weekend data entry"
                })
            field_scores.append(weekend_score)

            # Same-day hospital batching
            z_day = abs(
                h["same_day_visit_ratio"] - baseline["same_day_visit_ratio"]["mu"]
            ) / baseline["same_day_visit_ratio"]["sigma"]

            day_batch_score = min(z_day / 3.0, 1.0)
            if day_batch_score > 0.6 and h["same_day_visit_ratio"] > 0.4:
                signals.append({
                    "severity": "MINOR",
                    "score": round(day_batch_score, 2),
                    "reason": "Large proportion of visits occurred on the same clinical day"
                })
            field_scores.append(day_batch_score)

        # =====================================================
        # 3️⃣ Final aggregation
        # =====================================================
        behavioral_score = round(float(np.mean(field_scores)), 2) if field_scores else 0.0

        results[hospital_id] = {
            "behavioral_score": behavioral_score,
            "signals": signals
        }

    return results
