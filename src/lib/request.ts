export interface RequestOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string | object;
  type?: string;
}
export const request = (url: string, { method, headers, body, type }: RequestOptions = {}) => {
  return fetch(url, {
    method: method || 'GET',
    headers: Object.assign({ 'Content-Type': type ?? 'application/json' }, headers || {}),
    body: typeof body === 'object' ? JSON.stringify(body) : body,
  });
};
