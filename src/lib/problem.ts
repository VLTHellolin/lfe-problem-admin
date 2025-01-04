import { request } from './request';

export const getProblemData = async () => {
  if (typeof _feInjection !== 'undefined') {
    return _feInjection.currentData.problem;
  }

  const result = /^\/problem\/solution\/(.*)$/.exec(location.pathname);
  if (result === null) {
    return undefined;
  }

  const pid = result[1];
  const resp = await (await request(`/problem/${pid}?_contentOnly=1`)).json();

  return resp.currentData.problem;
};
