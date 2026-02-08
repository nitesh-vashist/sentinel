# import numpy as np
# import pandas as pd
# from collections import defaultdict


# def extract_cross_patient_features(df):
#     """
#     Builds patient-level vectors per hospital.

#     Returns:
#     {
#       hospital_id: {
#         patient_id: np.array([...])
#       }
#     }
#     """

#     # Only numeric values for MVP
#     df = df[df["value_number"].notna()].copy()

#     hospital_patient_vectors = defaultdict(dict)

#     # Group by hospital + patient
#     grouped = df.groupby(["hospital_id", "patient_id", "crf_field_id"])

#     # Aggregate values per patient-field (mean)
#     agg = grouped["value_number"].mean().reset_index()

#     for hospital_id, hdf in agg.groupby("hospital_id"):
#         # Pivot to patient x field matrix
#         pivot = hdf.pivot(
#             index="patient_id",
#             columns="crf_field_id",
#             values="value_number"
#         )

#         # Fill missing values with column medians
#         pivot = pivot.apply(
#             lambda col: col.fillna(col.median()),
#             axis=0
#         )

#         for patient_id, row in pivot.iterrows():
#             vector = row.values.astype(float)

#             # Normalize vector (important for cosine similarity)
#             norm = np.linalg.norm(vector)
#             if norm > 0:
#                 vector = vector / norm

#             hospital_patient_vectors[hospital_id][patient_id] = vector

#     return hospital_patient_vectors

# import numpy as np
# import pandas as pd
# from collections import defaultdict


# def extract_cross_patient_features(df):
#     """
#     Builds patient-level temporal signatures per hospital.

#     Each patient vector captures:
#     - mean value per field
#     - std deviation per field
#     - visit-to-visit slope (trend)

#     This preserves natural variability and progression shape.
#     """

#     df = df[df["value_number"].notna()].copy()
#     hospital_patient_vectors = defaultdict(dict)

#     for hospital_id, hdf in df.groupby("hospital_id"):
#         for patient_id, pdf in hdf.groupby("patient_id"):
#             field_vectors = []

#             for field_id, fdf in pdf.groupby("crf_field_id"):
#                 values = fdf.sort_values("visit_date")["value_number"].values

#                 if len(values) < 2:
#                     continue

#                 mean = np.mean(values)
#                 std = np.std(values)
#                 slope = values[-1] - values[0]

#                 field_vectors.extend([mean, std, slope])

#             if field_vectors:
#                 hospital_patient_vectors[hospital_id][patient_id] = np.array(
#                     field_vectors, dtype=float
#                 )

#     return hospital_patient_vectors

import numpy as np
from collections import defaultdict


def extract_cross_patient_features(df):
    """
    Build per-patient, per-field longitudinal signatures.

    Output format:
    {
      hospital_id: {
        patient_id: {
          field_id: {
            first,
            last,
            slope,
            std
          }
        }
      }
    }
    """

    df = df[df["value_number"].notna()].copy()
    hospital_data = defaultdict(dict)

    for hospital_id, hdf in df.groupby("hospital_id"):
        for patient_id, pdf in hdf.groupby("patient_id"):
            field_signatures = {}

            for field_id, fdf in pdf.groupby("crf_field_id"):
                fdf = fdf.sort_values("visit_date")
                values = fdf["value_number"].astype(float).values

                # Need longitudinal info
                if len(values) < 2:
                    continue

                field_signatures[field_id] = {
                    "first": float(values[0]),
                    "last": float(values[-1]),
                    "slope": float(values[-1] - values[0]),
                    "std": float(np.std(values))
                }

            if field_signatures:
                hospital_data[hospital_id][patient_id] = field_signatures

    return hospital_data
