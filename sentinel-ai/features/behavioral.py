# import numpy as np
# import pandas as pd


# def extract_behavioral_features(df):
#     """
#     Returns:
#     {
#       hospital_id: {
#         median_delay_days,
#         p90_delay_days,
#         submission_burstiness,
#         same_hour_ratio,
#         weekend_ratio,
#         visit_count
#       }
#     }
#     """
#     print("DEBUG DF COLUMNS:", df.columns.tolist())

#     features = {}

#     for hospital_id, hdf in df.groupby("hospital_id"):
        


#         # IMPORTANT: collapse to visit-level (one row per visit)
#         hdf_visits = (
#             hdf
#             .drop_duplicates(subset=["visit_id"])
#             .copy()
#         )

#         # Ensure datetime
#         # visit_dates = pd.to_datetime(hdf["visit_date"])
#         # created_times = pd.to_datetime(hdf["created_at"])

#         visit_dates = pd.to_datetime(hdf_visits["visit_date"])
#         created_times = pd.to_datetime(hdf_visits["created_at"])


#         # ---------------------------
#         # Same-day multi-visit per patient (ABSOLUTE RULE)
#         # ---------------------------
#         hdf_visits["visit_day"] = visit_dates.dt.date

#         patient_day_counts = (
#             hdf_visits
#             .groupby(["patient_id", "visit_day"])
#             .size()
#             .reset_index(name="visit_cnt")
#         )

#         violations = patient_day_counts[patient_day_counts["visit_cnt"] > 1]
#         violating_patients = violations["patient_id"].nunique()
#         total_patients = hdf_visits["patient_id"].nunique()

#         same_day_multi_visit_ratio = (
#             violating_patients / total_patients if total_patients > 0 else 0.0
#         )



#          # --- SAME-DAY VISIT CONCENTRATION (NEW) ---
#         visit_day_counts = visit_dates.dt.date.value_counts(normalize=True)
#         same_day_ratio = float(visit_day_counts.iloc[0])  # max concentration

#         # Entry delays in days
#         delays = (created_times - visit_dates).dt.total_seconds() / (24 * 3600)
#         delays = delays[delays >= 0]  # guard against bad clocks

#         if len(delays) == 0:
#             continue

#         median_delay = float(np.median(delays))
#         p90_delay = float(np.percentile(delays, 90))

#         # Submission burstiness (std of inter-arrival times in hours)
#         created_sorted = created_times.sort_values()
#         inter_arrival_hours = created_sorted.diff().dt.total_seconds() / 3600
#         inter_arrival_hours = inter_arrival_hours.dropna()

#         if len(inter_arrival_hours) > 0:
#             burstiness = float(np.std(inter_arrival_hours))
#         else:
#             burstiness = 0.0

#         # Same-hour submission ratio
#         hours = created_times.dt.hour
#         most_common_hour_ratio = float(hours.value_counts(normalize=True).iloc[0])

#         # Weekend submission ratio
#         weekend_ratio = float((created_times.dt.weekday >= 5).mean())

#         features[hospital_id] = {
#             "median_delay_days": median_delay,
#             "p90_delay_days": p90_delay,
#             "submission_burstiness": burstiness,
#             "same_hour_ratio": most_common_hour_ratio,
#             "weekend_ratio": weekend_ratio,
#             "same_day_visit_ratio": same_day_ratio,
#             "same_day_multi_visit_ratio": same_day_multi_visit_ratio, 
#             "visit_count": int(len(hdf))
#         }
#     print("DEBUG BEHAVIORAL FEATURES:", features)
#     return features

import numpy as np
import pandas as pd

MIN_VISIT_GAP_DAYS = 7.0


def extract_behavioral_features(df):
    """
    Absolute, hospital-local behavioral features
    """

    features = {}

    for hospital_id, hdf in df.groupby("hospital_id"):

        # Collapse to visit-level
        hdf_visits = (
            hdf
            .drop_duplicates(subset=["visit_id"])
            .copy()
        )

        if len(hdf_visits) < 2:
            continue

        visit_dates = pd.to_datetime(hdf_visits["visit_date"])
        created_times = pd.to_datetime(hdf_visits["created_at"])

        hdf_visits["visit_date"] = visit_dates

        # --------------------------------
        # ABSOLUTE: Inter-visit gap per patient
        # --------------------------------
        gap_violations = 0
        hard_violations = 0
        total_pairs = 0
        min_gap_days = None

        for _, pdf in hdf_visits.groupby("patient_id"):
            if len(pdf) < 2:
                continue

            pdf = pdf.sort_values("visit_date")
            gaps = pdf["visit_date"].diff().dt.total_seconds() / (24 * 3600)
            gaps = gaps.dropna()

            if gaps.empty:
                continue

            total_pairs += len(gaps)

            min_gap = gaps.min()
            min_gap_days = min(min_gap_days, min_gap) if min_gap_days is not None else min_gap

            hard_violations += (gaps < 1).sum()
            gap_violations += (gaps < MIN_VISIT_GAP_DAYS).sum()

        short_gap_ratio = (
            gap_violations / total_pairs if total_pairs > 0 else 0.0
        )

        # --------------------------------
        # Submission behavior (safe guards)
        # --------------------------------
        delays = (created_times - visit_dates).dt.total_seconds() / (24 * 3600)
        delays = delays[delays >= 0]

        median_delay = float(np.median(delays)) if len(delays) else 0.0
        p90_delay = float(np.percentile(delays, 90)) if len(delays) else 0.0

        created_sorted = created_times.sort_values()
        inter_arrival_hours = created_sorted.diff().dt.total_seconds() / 3600
        inter_arrival_hours = inter_arrival_hours.dropna()

        burstiness = float(np.std(inter_arrival_hours)) if len(inter_arrival_hours) else 0.0

        same_hour_ratio = float(
            created_times.dt.hour.value_counts(normalize=True).iloc[0]
        )

        weekend_ratio = float((created_times.dt.weekday >= 5).mean())

        # Same-day batching (hospital-level)
        visit_day_ratio = float(
            visit_dates.dt.date.value_counts(normalize=True).iloc[0]
        )

        features[hospital_id] = {
            "min_visit_gap_days": float(min_gap_days) if min_gap_days is not None else None,
            "short_gap_ratio": float(short_gap_ratio),
            "hard_gap_violations": int(hard_violations),
            "median_delay_days": median_delay,
            "p90_delay_days": p90_delay,
            "submission_burstiness": burstiness,
            "same_hour_ratio": same_hour_ratio,
            "weekend_ratio": weekend_ratio,
            "same_day_visit_ratio": visit_day_ratio,
            "visit_count": int(len(hdf_visits))
        }

    return features
