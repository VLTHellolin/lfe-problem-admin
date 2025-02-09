import { request } from './request';

export const getProblemData = async (problem?: string) => {
  const result = /^\/problem\/solution\/(.*)$/.exec(location.pathname);
  if (result === null && !problem) {
    // already problem page
    return JSON.parse(document.querySelector('#lentille-context')?.textContent as any).data.problem;
  }

  const pid = problem ?? (result as any)[1];
  const resp = await request(`/problem/${pid}`, { type: 'text/html' });

  const problemDocument = new DOMParser().parseFromString(resp, 'text/html');

  return JSON.parse(problemDocument.querySelector('#lentille-context')?.textContent as any).data.problem;
};
