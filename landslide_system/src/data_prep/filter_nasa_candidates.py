import pandas as pd
import os

# 1. Load Raw NASA GLC Export
raw_path = "data/raw/Global_Landslide_Catalog_Export.csv"
if not os.path.exists(raw_path):
    raise FileNotFoundError(f"Missing {raw_path}. Download from NASA portal first.")

df = pd.read_csv(raw_path)

# 2. Filter to India and clean dates
df = df[df["country_name"].fillna("").str.lower() == "india"].copy()
df["event_date"] = pd.to_datetime(df["event_date"], errors="coerce")
df = df.dropna(subset=["event_date", "latitude", "longitude"])

# 3. Filter for Rainfall Triggers and High Spatial Accuracy
rain_mask = df["landslide_trigger"].fillna("").str.lower().str.contains("rain|downpour|monsoon|cyclone")
accuracy_mask = df["location_accuracy"].fillna("").str.lower().isin(["exact", "1km", "5km"])
df = df[rain_mask & accuracy_mask]

# 4. Regional Macro-Bounding Box Tagging
def assign_region(lat, lon):
    if 8.0 <= lat <= 21.0 and 72.5 <= lon <= 78.0:
        return "Western_Ghats"
    elif 28.0 <= lat <= 37.0 and 72.0 <= lon <= 81.0:
        return "NW_Himalayas"
    elif 21.0 <= lat <= 29.0 and 87.0 <= lon <= 97.0:
        return "NE_Himalayas"
    return "UNASSIGNED"

df["region_id"] = [assign_region(a, b) for a, b in zip(df.latitude, df.longitude)]

# 5. Format to Candidate Contract Schema
out = df[["event_title", "latitude", "longitude", "event_date", "region_id", "landslide_trigger", "source_link"]].copy()
out.columns = ["event_name", "lat", "lon", "event_date", "region_id", "trigger_type", "source_reference"]

# Clean date string format and initialize verified flag
out["event_date"] = out["event_date"].dt.strftime("%Y-%m-%d")
out["trigger_type"] = "rainfall"
out["verified"] = False  # Stays False until manually verified

# Filter out unassigned regions
out = out[out["region_id"] != "UNASSIGNED"]

out_path = "data/raw/extra_events_candidates.csv"
out.to_csv(out_path, index=False)

print(f"Candidates generated: {len(out)} rows saved to {out_path}")
print("\nRegional Distribution:")
print(out["region_id"].value_counts())