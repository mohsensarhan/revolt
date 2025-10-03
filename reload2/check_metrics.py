import os
from supabase import create_client
from pathlib import Path

def load_env():
    data = {}
    env_path = Path('.env.local')
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' not in line:
                continue
            k, v = line.split('=', 1)
            data[k.strip()] = v.strip()
    data.update(os.environ)
    return data

env = load_env()
url = env.get('VITE_SUPABASE_URL')
key = env.get('VITE_SUPABASE_SERVICE_KEY') or env.get('SUPABASE_SERVICE_ROLE_KEY')
if not url or not key:
    raise SystemExit('Missing Supabase creds')
client = create_client(url, key)
res = client.table('executive_metrics').select('*').order('updated_at', desc=True).limit(1).execute()
print(res.data)
