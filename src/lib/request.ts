export interface RequestOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string | object;
  type?: string;
}
export const request = async (url: string, { method, headers, body, type }: RequestOptions = {}) => {
  const resp = await fetch(url, {
    method: method || 'GET',
    headers: Object.assign({ 'Content-Type': type ?? 'application/json' }, headers || {}),
    body: typeof body === 'object' ? JSON.stringify(body) : body,
  });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  return await resp.json();
};
