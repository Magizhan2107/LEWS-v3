import pandas as pd

df = pd.read_csv('data/raw/extra_events_candidates.csv')
parsed = pd.to_datetime(df['event_date'], format='%d-%m-%Y', errors='coerce')

bad = parsed.isna().sum()
print('rows:', len(df), '| unparseable dates:', bad)
if bad:
    print(df[parsed.isna()][['event_name', 'event_date']].head(20))
    raise SystemExit('Fix these rows by hand first.')

df['event_date'] = parsed.dt.strftime('%Y-%m-%d')
df.to_csv('data/raw/extra_events_candidates.csv', index=False)
print(df[['event_name', 'event_date']].head())