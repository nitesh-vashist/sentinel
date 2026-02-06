import sys
from runner import run_ai_for_trial

if __name__ == "__main__":
    trial_id = sys.argv[1]
    results = run_ai_for_trial(trial_id)
    print(results)
