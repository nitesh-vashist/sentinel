import numpy as np


# ---------------------------
# Baseline builder
# ---------------------------

def build_behavioral_baseline(features):
    """
    Input:
      features = {
        hospital_id: {
          median_delay_days,
          p90_delay_days,
          submission_burstiness,
          same_hour_ratio,
          weekend_ratio,
          visit_count
        }
      }

    Output:
      baseline stats per feature
    """
    keys = [
        "median_delay_days",
        "p90_delay_days",
        "submission_burstiness",
        "same_hour_ratio",
        "weekend_ratio",
    ]

    baseline = {k: [] for k in keys}

    for h in features.values():
        for k in keys:
            baseline[k].append(h[k])

    # compute mu/sigma with guards
    stats = {}
    for k, vals in baseline.items():
        vals = np.array(vals, dtype=float)
        stats[k] = {
            "mu": float(np.mean(vals)),
            "sigma": float(np.std(vals)) + 1e-6
        }

    return stats


def z_score(value, mu, sigma):
    return abs(value - mu) / sigma


# ---------------------------
# Detector
# ---------------------------

def detect_behavioral_anomalies(features, baseline):
    """
    Returns:
    {
      hospital_id: {
        "behavioral_score": float,
        "signals": [
          {
            "score": float,
            "reason": str
          }
        ]
      }
    }
    """

    results = {}

    for hospital_id, h in features.items():
        signals = []
        field_scores = []

        # 1) Entry delay anomalies
        z_med = z_score(h["median_delay_days"],
                        baseline["median_delay_days"]["mu"],
                        baseline["median_delay_days"]["sigma"])
        z_p90 = z_score(h["p90_delay_days"],
                        baseline["p90_delay_days"]["mu"],
                        baseline["p90_delay_days"]["sigma"])

        delay_score = min(max(z_med, z_p90) / 3.0, 1.0)
        if delay_score > 0.6:
            signals.append({
                "score": round(delay_score, 2),
                "reason": "Unusually high delay between visit date and data entry"
            })
        field_scores.append(delay_score)

        # 2) Burst submission anomalies (very low variance between submissions)
        z_burst = z_score(h["submission_burstiness"],
                          baseline["submission_burstiness"]["mu"],
                          baseline["submission_burstiness"]["sigma"])

        burst_score = min(z_burst / 3.0, 1.0)
        if burst_score > 0.6:
            signals.append({
                "score": round(burst_score, 2),
                "reason": "Batch-style submission behavior detected"
            })
        field_scores.append(burst_score)

        # 3) Same-hour concentration
        # High same-hour ratio is suspicious
        z_hour = z_score(h["same_hour_ratio"],
                         baseline["same_hour_ratio"]["mu"],
                         baseline["same_hour_ratio"]["sigma"])

        hour_score = min(z_hour / 3.0, 1.0)
        if hour_score > 0.6 and h["same_hour_ratio"] > 0.4:
            signals.append({
                "score": round(hour_score, 2),
                "reason": "Large fraction of visits entered in the same hour"
            })
        field_scores.append(hour_score)

        # 4) Weekend-heavy submissions
        z_weekend = z_score(h["weekend_ratio"],
                            baseline["weekend_ratio"]["mu"],
                            baseline["weekend_ratio"]["sigma"])

        weekend_score = min(z_weekend / 3.0, 1.0)
        if weekend_score > 0.6 and h["weekend_ratio"] > 0.4:
            signals.append({
                "score": round(weekend_score, 2),
                "reason": "Unusually high proportion of weekend data entry"
            })
        field_scores.append(weekend_score)

        # Aggregate hospital behavioral score
        if field_scores:
            behavioral_score = round(float(np.mean(field_scores)), 2)
        else:
            behavioral_score = 0.0

        results[hospital_id] = {
            "behavioral_score": behavioral_score,
            "signals": signals
        }

    return results
