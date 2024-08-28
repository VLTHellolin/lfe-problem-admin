import { type ReviewHistory } from './types';

const Name = 'problem-admin-history';

export const getValue = function () {
  const result = localStorage.getItem(Name);
  if (result === null) {
    const newItem: ReviewHistory = {
      reasons: 'https://www.luogu.com.cn/paste/pel0tgzp',
      accept: 0,
      decline: 0,
      data: [],
    };
    setValue(newItem);
    return newItem;
  } else {
    return JSON.parse(result) as ReviewHistory;
  }
};

export const setValue = function (e: ReviewHistory) {
  localStorage.setItem(Name, JSON.stringify(e));
};

export const removeValue = function () {
  localStorage.removeItem(Name);
};
