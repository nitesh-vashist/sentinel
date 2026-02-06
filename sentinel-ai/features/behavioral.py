import numpy as np
import pandas as pd


def extract_behavioral_features(df):
    """
    Returns:
    {
      hospital_id: {
        median_delay_days,
        p90_delay_days,
        submission_burstiness,
        same_hour_ratio,
        weekend_ratio,
        visit_count
      }
    }
    """

    features = {}

    for hospital_id, hdf in df.groupby("hospital_id"):
        if len(hdf) < 5:
            continue  # not enough data to judge behavior

        # Ensure datetime
        visit_dates = pd.to_datetime(hdf["visit_date"])
        created_times = pd.to_datetime(hdf["created_at"])

        # Entry delays in days
        delays = (created_times - visit_dates).dt.total_seconds() / (24 * 3600)
        delays = delays[delays >= 0]  # guard against bad clocks

        if len(delays) == 0:
            continue

        median_delay = float(np.median(delays))
        p90_delay = float(np.percentile(delays, 90))

        # Submission burstiness (std of inter-arrival times in hours)
        created_sorted = created_times.sort_values()
        inter_arrival_hours = created_sorted.diff().dt.total_seconds() / 3600
        inter_arrival_hours = inter_arrival_hours.dropna()

        if len(inter_arrival_hours) > 0:
            burstiness = float(np.std(inter_arrival_hours))
        else:
            burstiness = 0.0

        # Same-hour submission ratio
        hours = created_times.dt.hour
        most_common_hour_ratio = float(hours.value_counts(normalize=True).iloc[0])

        # Weekend submission ratio
        weekend_ratio = float((created_times.dt.weekday >= 5).mean())

        features[hospital_id] = {
            "median_delay_days": median_delay,
            "p90_delay_days": p90_delay,
            "submission_burstiness": burstiness,
            "same_hour_ratio": most_common_hour_ratio,
            "weekend_ratio": weekend_ratio,
            "visit_count": int(len(hdf))
        }

    return features
