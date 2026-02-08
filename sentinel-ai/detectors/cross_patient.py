# import numpy as np
# from itertools import combinations


# # ---------------------------
# # Similarity helper
# # ---------------------------

# def cosine_similarity(v1, v2):
#     if v1 is None or v2 is None:
#         return 0.0
#     return float(np.dot(v1, v2))


# # ---------------------------
# # Detector
# # ---------------------------

# def detect_cross_patient_templating(
#     hospital_patient_vectors,
#     similarity_threshold=0.95,
#     min_similar_pairs=3
# ):
#     """
#     Input:
#     {
#       hospital_id: {
#         patient_id: vector
#       }
#     }

#     Output:
#     {
#       hospital_id: {
#         "cross_patient_score": float,
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

#     for hospital_id, patient_vectors in hospital_patient_vectors.items():
#         patient_ids = list(patient_vectors.keys())

#         # Need at least 3 patients to compare meaningfully
#         if len(patient_ids) < 3:
#             results[hospital_id] = {
#                 "cross_patient_score": 0.0,
#                 "signals": []
#             }
#             continue

#         similarities = []
#         high_similarity_pairs = []

#         # Pairwise patient comparison
#         for p1, p2 in combinations(patient_ids, 2):
#             v1 = patient_vectors[p1]
#             v2 = patient_vectors[p2]

#             sim = cosine_similarity(v1, v2)
#             similarities.append(sim)

#             if sim >= similarity_threshold:
#                 high_similarity_pairs.append((p1, p2, sim))

#         if not similarities:
#             results[hospital_id] = {
#                 "cross_patient_score": 0.0,
#                 "signals": []
#             }
#             continue

#         # Compute metrics
#         avg_similarity = float(np.mean(similarities))
#         max_similarity = float(np.max(similarities))
#         similar_pair_ratio = len(high_similarity_pairs) / len(similarities)

#         # Build score (conservative)
#         score_components = [
#             avg_similarity,
#             max_similarity,
#             min(similar_pair_ratio * 2, 1.0)
#         ]

#         cross_patient_score = round(float(np.mean(score_components)), 2)

#         signals = []

#         if len(high_similarity_pairs) >= min_similar_pairs:
#             signals.append({
#                 "score": round(cross_patient_score, 2),
#                 "reason": (
#                     f"Multiple patient profiles show very high similarity "
#                     f"(≥ {similarity_threshold}). Possible template-based reporting."
#                 )
#             })

#         results[hospital_id] = {
#             "cross_patient_score": cross_patient_score,
#             "signals": signals
#         }

#     return results

# import numpy as np
# from itertools import combinations


# def cosine_similarity(v1, v2):
#     return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-8))


# def detect_cross_patient_templating(
#     hospital_patient_vectors,
#     similarity_threshold=0.97,
#     min_similar_pairs=3,
#     min_patients=3
# ):
#     """
#     Detects true patient templating, not natural cohort similarity.
#     """

#     results = {}

#     for hospital_id, patient_vectors in hospital_patient_vectors.items():
#         patient_ids = list(patient_vectors.keys())

#         # 🔒 HARD GUARD — no accusations with small cohorts
#         if len(patient_ids) < min_patients:
#             results[hospital_id] = {
#                 "cross_patient_score": 0.0,
#                 "signals": []
#             }
#             continue

#         similarities = []
#         high_similarity_pairs = []

#         for p1, p2 in combinations(patient_ids, 2):
#             sim = cosine_similarity(
#                 patient_vectors[p1],
#                 patient_vectors[p2]
#             )
#             similarities.append(sim)

#             if sim >= similarity_threshold:
#                 high_similarity_pairs.append(sim)

#         if not similarities:
#             results[hospital_id] = {
#                 "cross_patient_score": 0.0,
#                 "signals": []
#             }
#             continue

#         # STRONG EVIDENCE OVERRIDE:
#         # If multiple pairs are almost identical, this is not natural
#         very_high_pairs = [s for s in similarities if s >= 0.995]

#         if len(very_high_pairs) >= 2:
#             results[hospital_id] = {
#                 "cross_patient_score": 1.0,
#                 "signals": [{
#                     "score": 1.0,
#                     "reason": (
#                         "Multiple patient records are nearly identical across "
#                         "longitudinal clinical features, which is inconsistent "
#                         "with natural patient variability."
#                     )
#                 }]
#             }
#             continue


#         similarities = np.array(similarities)

#         # 🔍 Natural cohorts have spread; templating collapses variance
#         if np.std(similarities) < 0.01:
#             # Everyone looks similar → likely cohort homogeneity
#             results[hospital_id] = {
#                 "cross_patient_score": 0.0,
#                 "signals": []
#             }
#             continue

#         ratio = len(high_similarity_pairs) / len(similarities)
#         score = min(ratio * 1.5, 1.0)

#         signals = []
#         if len(high_similarity_pairs) >= min_similar_pairs:
#             signals.append({
#                 "score": round(score, 2),
#                 "reason": (
#                     "Multiple patients show near-identical longitudinal "
#                     "patterns across several clinical fields, inconsistent "
#                     "with natural patient variability."
#                 )
#             })

#         results[hospital_id] = {
#             "cross_patient_score": round(score, 2),
#             "signals": signals
#         }

#     return results

from itertools import combinations


def detect_cross_patient_templating(
    hospital_patient_data,
    value_tol=0.1,
    slope_tol=0.1,
    min_matching_fields=4,
    min_pairs=2
):
    """
    Detects true cross-patient templating.

    A patient pair is considered templated only if
    MANY fields share nearly identical longitudinal patterns.
    """

    results = {}

    for hospital_id, patients in hospital_patient_data.items():
        patient_ids = list(patients.keys())

        # Too few patients → no accusation
        if len(patient_ids) < 3:
            results[hospital_id] = {
                "cross_patient_score": 0.0,
                "signals": []
            }
            continue

        templated_pairs = 0

        for p1, p2 in combinations(patient_ids, 2):
            sig1 = patients[p1]
            sig2 = patients[p2]

            common_fields = set(sig1.keys()) & set(sig2.keys())
            matching_fields = 0

            for field in common_fields:
                f1 = sig1[field]
                f2 = sig2[field]

                if (
                    abs(f1["first"] - f2["first"]) <= value_tol and
                    abs(f1["last"] - f2["last"]) <= value_tol and
                    abs(f1["slope"] - f2["slope"]) <= slope_tol
                ):
                    matching_fields += 1

            # Only count as templated if MANY fields match
            if matching_fields >= min_matching_fields:
                templated_pairs += 1

        score = min(templated_pairs / min_pairs, 1.0)

        signals = []
        if templated_pairs >= min_pairs:
            signals.append({
                "score": round(score, 2),
                "reason": (
                    "Multiple patients exhibit near-identical longitudinal "
                    "patterns across several clinical fields, which is "
                    "inconsistent with natural patient variability and "
                    "suggests template-based reporting."
                )
            })

        results[hospital_id] = {
            "cross_patient_score": round(score, 2),
            "signals": signals
        }

    return results
