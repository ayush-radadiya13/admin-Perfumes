const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function adminFetch(path, options = {}) {
  const { token, method = 'GET', body, isForm } = options;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}/api/admin${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

export async function uploadImage(token, file) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${API}/api/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.url;
}

export { API };
