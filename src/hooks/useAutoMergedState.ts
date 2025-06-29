import { useReducer } from 'react';

export const useAutoMergedState = <T>(initialState: T) => {
  return useReducer((prev, next: Partial<T>) => ({
    ...prev, ...next,
  }), initialState);
};
