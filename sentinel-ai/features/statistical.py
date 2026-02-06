import numpy as np
from scipy.stats import iqr, entropy

def _rounding_ratio(values):
    if len(values) == 0:
        return 0.0
    rounded = [v for v in values if v % 5 == 0]
    return len(rounded) / len(values)



def extract_statistical_features(df):
    """
    Returns:
    {
      hospital_id: {
        field_id: {
          mean, std, iqr, entropy, rounding_ratio, count
        }
      }
    }
    """
    features = {}

    grouped = df.groupby(["hospital_id", "crf_field_id"])

    for (hospital_id, field_id), g in grouped:
        values = g["value_number"].dropna().values
        if len(values) < 5:
            continue  # too little data to judge

        hist, _ = np.histogram(values, bins=10, density=True)
        hist = hist[hist > 0]

        hospital_features = features.setdefault(hospital_id, {})
        hospital_features[field_id] = {
            "mean": float(np.mean(values)),
            "std": float(np.std(values)),
            "iqr": float(iqr(values)),
            "entropy": float(entropy(hist)),
            "rounding_ratio": _rounding_ratio(values),
            "count": int(len(values))
        }

    return features
