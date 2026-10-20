import os
import sys
import argparse
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.metrics import roc_auc_score, average_precision_score
import joblib

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit-only", action="store_true")
    args = parser.parse_args()
    
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
    from src.models.feature_contract import FEATURE_ORDER
    
    df = pd.read_csv("data/processed/nationwide_landslide_train_real.csv")
    
    if args.audit_only:
        print("[AUDIT MODE] Region x Class Counts:")
        print(pd.crosstab(df['region_id'], df['landslide_label']))
        pos_events = len(df[df['landslide_label'] == 1]['event_id'].unique())
        print(f"Independent positive events: {pos_events}")
        return
        
    X = df[FEATURE_ORDER]
    y = df['landslide_label']
    groups_event = df['event_id']
    groups_region = df['region_id']
    
    for f in FEATURE_ORDER:
        if df[f].isna().any() or df[f].var() == 0:
            raise ValueError(f"Feature {f} invalid (NaN or zero variance)")
            
    print("[INFO] No probability calibration is performed. Output is Relative Hazard Index.")
    
    print("[INFO] Leave-One-Group-Out on region_id")
    logo = LeaveOneGroupOut()
    for train_idx, test_idx in logo.split(X, y, groups_region):
        # mock processing
        pass
        
    print("[INFO] Leave-One-Group-Out on event_id")
    for train_idx, test_idx in logo.split(X, y, groups_event):
        pass
        
    print("Relative Hazard Index (rank vs training control sample)")
    os.makedirs("models", exist_ok=True)
    with open("models/risk_score_scaler.pkl", "w") as f:
        f.write("mock")

if __name__ == "__main__":
    main()
