import pandas as pd
import numpy as np

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2.0)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2.0)**2
    return 2 * R * np.arcsin(np.sqrt(a))

# Load candidates
df = pd.read_csv("data/raw/extra_events_candidates.csv")
df["event_date"] = pd.to_datetime(df["event_date"])

# 1. Flag potential duplicates (within 10 km and 3 days)
duplicates = []
coords = df[["lat", "lon"]].to_numpy()
dates = df["event_date"].to_numpy()

for i in range(len(df)):
    for j in range(i + 1, len(df)):
        dist = haversine(coords[i][0], coords[i][1], coords[j][0], coords[j][1])
        days = abs((dates[i] - dates[j]).astype('timedelta64[D]').astype(int))
        if dist <= 10.0 and days <= 3:
            duplicates.append(j)

df_clean = df.drop(index=list(set(duplicates))).copy()

# 2. Add clickable verification URLs
df_clean["google_maps_url"] = [f"https://www.google.com/maps?q={lat},{lon}" for lat, lon in zip(df_clean["lat"], df_clean["lon"])]
df_clean["search_url"] = [f"https://www.google.com/search?q=landslide+{name}+{date.strftime('%Y-%m-%d')}" 
                          for name, date in zip(df_clean["event_name"], df_clean["event_date"])]

df_clean.to_csv("data/raw/extra_events_to_verify.csv", index=False)
print(f"Cleaned candidates: {len(df_clean)} rows written to data/raw/extra_events_to_verify.csv")