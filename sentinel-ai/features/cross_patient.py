import numpy as np
import pandas as pd
from collections import defaultdict


def extract_cross_patient_features(df):
    """
    Builds patient-level vectors per hospital.

    Returns:
    {
      hospital_id: {
        patient_id: np.array([...])
      }
    }
    """

    # Only numeric values for MVP
    df = df[df["value_number"].notna()].copy()

    hospital_patient_vectors = defaultdict(dict)

    # Group by hospital + patient
    grouped = df.groupby(["hospital_id", "patient_id", "crf_field_id"])

    # Aggregate values per patient-field (mean)
    agg = grouped["value_number"].mean().reset_index()

    for hospital_id, hdf in agg.groupby("hospital_id"):
        # Pivot to patient x field matrix
        pivot = hdf.pivot(
            index="patient_id",
            columns="crf_field_id",
            values="value_number"
        )

        # Fill missing values with column medians
        pivot = pivot.apply(
            lambda col: col.fillna(col.median()),
            axis=0
        )

        for patient_id, row in pivot.iterrows():
            vector = row.values.astype(float)

            # Normalize vector (important for cosine similarity)
            norm = np.linalg.norm(vector)
            if norm > 0:
                vector = vector / norm

            hospital_patient_vectors[hospital_id][patient_id] = vector

    return hospital_patient_vectors
