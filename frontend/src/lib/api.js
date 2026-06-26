const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchTimeline() {
  const res = await fetch(`${API_URL}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline data');
  return res.json();
}

export async function fetchClusters() {
  const res = await fetch(`${API_URL}/clusters`);
  if (!res.ok) throw new Error('Failed to fetch clusters');
  return res.json();
}

export async function fetchClusterDetails(id) {
  const res = await fetch(`${API_URL}/clusters/${id}`);
  if (!res.ok) throw new Error('Failed to fetch cluster details');
  return res.json();
}

export async function fetchSources() {
  const res = await fetch(`${API_URL}/sources`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_URL}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function triggerIngest() {
  const res = await fetch(`${API_URL}/ingest/trigger`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger ingestion');
  return res.json();
}

export async function getIngestStatus(jobId) {
  const res = await fetch(`${API_URL}/ingest/status/${jobId}`);
  if (!res.ok) throw new Error('Failed to check ingestion status');
  return res.json();
}
