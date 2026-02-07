import numpy as np


def detect_cross_hospital_deviation(hospital_vectors):
    """
    Input:
    {
      hospital_id: np.array([stat, beh, cp])
    }

    Output:
    {
      hospital_id: {
        "peer_deviation_score": float,
        "signals": [...]
      }
    }
    """

    results = {}

    if len(hospital_vectors) < 2:
        # Cannot compare peers with <2 hospitals
        for h in hospital_vectors:
            results[h] = {
                "peer_deviation_score": 0.0,
                "signals": []
            }
        return results

    hospital_ids = list(hospital_vectors.keys())
    vectors = np.array(list(hospital_vectors.values()))

    # Compute peer centroid
    centroid = np.mean(vectors, axis=0)

    # Compute distances from centroid
    distances = {
        hospital_ids[i]: float(np.linalg.norm(vectors[i] - centroid))
        for i in range(len(hospital_ids))
    }

    dist_values = np.array(list(distances.values()))
    mean_dist = float(np.mean(dist_values))
    std_dist = float(np.std(dist_values)) + 1e-6

    for hospital_id, dist in distances.items():
        z = abs(dist - mean_dist) / std_dist
        score = min(z / 3.0, 1.0)

        signals = []
        if score > 0.6:
            signals.append({
                "score": round(score, 2),
                "reason": (
                    "Hospital shows significant overall deviation "
                    "from peer hospitals across multiple integrity dimensions"
                )
            })

        results[hospital_id] = {
            "peer_deviation_score": round(float(score), 2),
            "signals": signals
        }

    return results
