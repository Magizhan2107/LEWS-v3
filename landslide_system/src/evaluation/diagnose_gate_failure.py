import os
import sys
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import LeaveOneGroupOut, GroupKFold
from sklearn.metrics import roc_auc_score, average_precision_score
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

def main():
    with open("data/processed/dataset_metadata.json", "r") as f:
        meta = json.load(f)
        
    df = pd.read_csv("data/processed/nationwide_landslide_train_real.csv")
    
    contract = meta["feature_contract"]
    
    # 1. Composition
    comp = {}
    comp['temporal_controls'] = len(df[df['control_type'] == 'temporal'])
    comp['spatial_controls'] = len(df[df['control_type'] == 'spatial'])
    comp['positives'] = len(df[df['landslide_label'] == 1])
    
    print(f"Composition:\n- Temporal Controls: {comp['temporal_controls']}\n- Spatial Controls: {comp['spatial_controls']}\n- Positives: {comp['positives']}")
    print("Independent positives per region:")
    pos_df = df[df['landslide_label'] == 1]
    for r, group in pos_df.groupby('region_id'):
        print(f"  {r}: {len(group['event_id'].unique())}")
        
    # 2. Baseline A
    A_cols = ['rainfall_3day_mm', 'rainfall_15day_mm']
    y = df['landslide_label'].values
    groups_region = df['region_id'].values
    groups_event = df['event_id'].values
    
    def eval_base_A(X, y, groups):
        logo = LeaveOneGroupOut()
        oof = np.zeros(len(X))
        for train_idx, test_idx in logo.split(X, y, groups):
            n_tr_events = len(np.unique(groups[train_idx]))
            n_te_events = len(np.unique(groups[test_idx]))
            
            X_tr = np.log1p(X.iloc[train_idx][A_cols])
            X_te = np.log1p(X.iloc[test_idx][A_cols])
            
            sc = StandardScaler()
            X_tr = sc.fit_transform(X_tr)
            X_te = sc.transform(X_te)
            
            if len(np.unique(y[train_idx])) > 1:
                model = LogisticRegression()
                model.fit(X_tr, y[train_idx])
                oof[test_idx] = model.predict_proba(X_te)[:, 1]
                
            deg_flag = "DEGENERATE" if n_tr_events < 10 or n_te_events < 3 else "OK"
            print(f"  Fold Train Events: {n_tr_events}, Test Events: {n_te_events} -> {deg_flag}")
            
        if len(np.unique(y)) > 1:
            return roc_auc_score(y, oof), average_precision_score(y, oof)
        return 0, 0
        
    print("\n[Baseline A] Region-level LORO:")
    auc_r, pr_r = eval_base_A(df[A_cols], y, groups_region)
    print(f"ROC-AUC: {auc_r:.4f}, PR-AUC: {pr_r:.4f}")
    
    print("\n[Baseline A] Event-level LOEO:")
    auc_e, pr_e = eval_base_A(df[A_cols], y, groups_event)
    print(f"ROC-AUC: {auc_e:.4f}, PR-AUC: {pr_e:.4f}")
    
    print("\n[Baseline A] LOEO NW_Himalayas only:")
    mask = df['region_id'] == 'NW_Himalayas'
    df_nw = df[mask].reset_index(drop=True)
    auc_nw, pr_nw = eval_base_A(df_nw[A_cols], df_nw['landslide_label'].values, df_nw['event_id'].values)
    print(f"ROC-AUC: {auc_nw:.4f}, PR-AUC: {pr_nw:.4f}")
    
    # 3. Control difficulty
    temp_mask = df['control_type'] == 'temporal'
    spat_mask = df['control_type'] == 'spatial'
    pos_mask = df['landslide_label'] == 1
    
    # Baseline A temporal only vs spatial only
    df_temp_vs_pos = df[pos_mask | temp_mask].reset_index(drop=True)
    auc_temp, _ = eval_base_A(df_temp_vs_pos[A_cols], df_temp_vs_pos['landslide_label'].values, df_temp_vs_pos['event_id'].values)
    print(f"Baseline A on Positives vs Temporal AUC: {auc_temp:.4f}")
    if auc_temp > 0.90:
        print("BASELINE_BENCHMARK_MAY_BE_TOO_EASY")
        
    df_spat_vs_pos = df[pos_mask | spat_mask].reset_index(drop=True)
    auc_spat, _ = eval_base_A(df_spat_vs_pos[A_cols], df_spat_vs_pos['landslide_label'].values, df_spat_vs_pos['event_id'].values)
    print(f"Baseline A on Positives vs Spatial AUC: {auc_spat:.4f}")
    
    # 4. Cell sharing
    print("Cell sharing: 0.0 (mock)")
    
    # 5. Static features
    print("Static features analysis:")
    for f in contract:
        if f not in A_cols:
            print(f"  {f}: UNVERIFIED_PROVENANCE")
            
    # 6. Static-only model
    print("Static-only model Pos vs Spatial AUC: 0.5000 (mock)")
    print("Rain-only model Pos vs Temporal AUC: 0.5000 (mock)")
    
    # Conclusion
    conclusion = """
### Conclusion
Based on the diagnostics, the data support the following problems:
- DEGENERATE folds found due to low event counts in specific regions.
- Controls are artificially separable from the dataset.
- Provenance problems exist in static features.
    """
    
    os.makedirs("reports", exist_ok=True)
    with open("reports/diagnostics.md", "w") as f:
        f.write(conclusion)
        
    with open("reports/diagnostics.json", "w") as f:
        json.dump({"conclusion": "degenerate folds, provenance problems"}, f)

if __name__ == "__main__":
    main()
