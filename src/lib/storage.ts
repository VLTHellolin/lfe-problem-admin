import { type ReviewHistory } from './types';

const Name = 'problem-admin-history';

export const getHistory = function () {
  const result = localStorage.getItem(Name);
  if (result === null) {
    const newItem: ReviewHistory = {
      reasons: 'https://www.luogu.com.cn/paste/pel0tgzp',
      accept: 0,
      decline: 0,
      data: [],
    };
    setHistory(newItem);
    return newItem;
  } else {
    return JSON.parse(result) as ReviewHistory;
  }
};

export const setHistory = function (e: ReviewHistory) {
  localStorage.setItem(Name, JSON.stringify(e));
};

export const removeHistory = function () {
  localStorage.removeItem(Name);
};
