import numpy as np

def build_trial_baseline(features):
    """
    Input: hospital -> field -> features
    Output: field -> baseline stats
    """
    baseline = {}

    for hospital_data in features.values():
        for field_id, stats in hospital_data.items():
            field = baseline.setdefault(field_id, {
                "means": [],
                "stds": [],
                "iqrs": [],
                "entropies": []
            })

            field["means"].append(stats["mean"])
            field["stds"].append(stats["std"])
            field["iqrs"].append(stats["iqr"])
            field["entropies"].append(stats["entropy"])

    for field_id, field in baseline.items():
        baseline[field_id] = {
            "mean_mu": np.mean(field["means"]),
            "mean_sigma": np.std(field["means"]) + 1e-6,
            "std_mu": np.mean(field["stds"]),
            "std_sigma": np.std(field["stds"]) + 1e-6,
            "entropy_mu": np.mean(field["entropies"]),
            "entropy_sigma": np.std(field["entropies"]) + 1e-6,
        }

    return baseline

def z_score(value, mu, sigma):
    return abs(value - mu) / sigma


def detect_statistical_anomalies(features, baseline):
    """
    Returns:
    {
      hospital_id: {
        "score": float,
        "signals": [ {field, reason, severity} ]
      }
    }
    """
    results = {}

    for hospital_id, hospital_data in features.items():
        total_score = 0.0
        signals = []
        n = 0

        for field_id, stats in hospital_data.items():
            if field_id not in baseline:
                continue

            base = baseline[field_id]

            mean_z = z_score(stats["mean"], base["mean_mu"], base["mean_sigma"])
            std_z = z_score(stats["std"], base["std_mu"], base["std_sigma"])
            entropy_z = z_score(stats["entropy"], base["entropy_mu"], base["entropy_sigma"])

            field_score = max(mean_z, std_z, entropy_z) / 3.0
            field_score = min(field_score, 1.0)

            if field_score > 0.6:
                reason = []
                if std_z > 2:
                    reason.append("Unusually low variance")
                if entropy_z > 2:
                    reason.append("Low randomness")
                if stats["rounding_ratio"] > 0.4:
                    reason.append("Heavy rounding bias")

                signals.append({
                    "field_id": field_id,
                    "score": round(field_score, 2),
                    "reason": ", ".join(reason)
                })

            total_score += field_score
            n += 1

        final_score = total_score / n if n else 0.0

        results[hospital_id] = {
            "statistical_score": round(final_score, 2),
            "signals": signals
        }

    return results
