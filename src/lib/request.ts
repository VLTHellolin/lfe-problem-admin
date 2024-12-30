import { GM_xmlhttpRequest } from '$';

export interface ResponseType<T = unknown> {
  finalUrl: string;
  get json(): T;
  readyState: number;
  status: number;
  statusText: string;
}

export const csRequest = async <T = unknown>(param: {
  method: 'GET' | 'POST';
  url: string;
  data?: string;
  headers?: Record<string, string>;
}): Promise<ResponseType<T>> => {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      ...param,
      onload: resp => {
        const response: ResponseType<T> = {
          ...resp,
          get json(): T {
            return JSON.parse(resp.response);
          },
        };
        if (response.status < 200 || response.status > 299) {
          reject(response);
        }
        resolve(response);
      },
      onerror: reject,
    });
  });
};

export const csGet = async <T = unknown>(url: string, headers: Record<string, string> = {}) =>
  await csRequest<T>({
    method: 'GET',
    url,
    headers,
  });
export const csPost = async <T = unknown>(url: string, data: string | object, headers: Record<string, string> = {}, type = 'application/json') =>
  await csRequest<T>({
    method: 'POST',
    url,
    data: typeof data === 'string' ? data : JSON.stringify(data),
    headers: Object.assign({ 'Content-Type': typeof data === 'string' ? type : 'application/json' }, headers),
  });
