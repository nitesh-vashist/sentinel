import numpy as np


def extract_cross_hospital_features(
    statistical_results,
    behavioral_results,
    cross_patient_results
):
    """
    Builds hospital-level feature vectors.

    Returns:
    {
      hospital_id: np.array([
        statistical_score,
        behavioral_score,
        cross_patient_score
      ])
    }
    """

    hospital_vectors = {}

    all_hospitals = (
        set(statistical_results.keys())
        | set(behavioral_results.keys())
        | set(cross_patient_results.keys())
    )

    for hospital_id in all_hospitals:
        stat = statistical_results.get(hospital_id, {}).get("statistical_score", 0.0)
        beh = behavioral_results.get(hospital_id, {}).get("behavioral_score", 0.0)
        cp = cross_patient_results.get(hospital_id, {}).get("cross_patient_score", 0.0)

        vector = np.array([stat, beh, cp], dtype=float)

        hospital_vectors[hospital_id] = vector

    return hospital_vectors
