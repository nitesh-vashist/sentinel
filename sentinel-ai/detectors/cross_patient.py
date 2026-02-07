import numpy as np
from itertools import combinations


# ---------------------------
# Similarity helper
# ---------------------------

def cosine_similarity(v1, v2):
    if v1 is None or v2 is None:
        return 0.0
    return float(np.dot(v1, v2))


# ---------------------------
# Detector
# ---------------------------

def detect_cross_patient_templating(
    hospital_patient_vectors,
    similarity_threshold=0.95,
    min_similar_pairs=3
):
    """
    Input:
    {
      hospital_id: {
        patient_id: vector
      }
    }

    Output:
    {
      hospital_id: {
        "cross_patient_score": float,
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

    for hospital_id, patient_vectors in hospital_patient_vectors.items():
        patient_ids = list(patient_vectors.keys())

        # Need at least 3 patients to compare meaningfully
        if len(patient_ids) < 3:
            results[hospital_id] = {
                "cross_patient_score": 0.0,
                "signals": []
            }
            continue

        similarities = []
        high_similarity_pairs = []

        # Pairwise patient comparison
        for p1, p2 in combinations(patient_ids, 2):
            v1 = patient_vectors[p1]
            v2 = patient_vectors[p2]

            sim = cosine_similarity(v1, v2)
            similarities.append(sim)

            if sim >= similarity_threshold:
                high_similarity_pairs.append((p1, p2, sim))

        if not similarities:
            results[hospital_id] = {
                "cross_patient_score": 0.0,
                "signals": []
            }
            continue

        # Compute metrics
        avg_similarity = float(np.mean(similarities))
        max_similarity = float(np.max(similarities))
        similar_pair_ratio = len(high_similarity_pairs) / len(similarities)

        # Build score (conservative)
        score_components = [
            avg_similarity,
            max_similarity,
            min(similar_pair_ratio * 2, 1.0)
        ]

        cross_patient_score = round(float(np.mean(score_components)), 2)

        signals = []

        if len(high_similarity_pairs) >= min_similar_pairs:
            signals.append({
                "score": round(cross_patient_score, 2),
                "reason": (
                    f"Multiple patient profiles show very high similarity "
                    f"(≥ {similarity_threshold}). Possible template-based reporting."
                )
            })

        results[hospital_id] = {
            "cross_patient_score": cross_patient_score,
            "signals": signals
        }

    return results
