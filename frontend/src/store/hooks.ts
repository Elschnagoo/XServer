import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch, RootState } from './store';
import { selectMode } from '@/store/MovieStore';
import { PlayMode } from '@/lib';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();

export type DispatchType = ReturnType<typeof useAppDispatch>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function usePlayMode() {
  const mode = useAppSelector(selectMode);

  return useCallback(
    (forceRaw = false) => {
      if (forceRaw && (mode === PlayMode.DEFAULT || mode === PlayMode.RAW)) {
        return `profile=${PlayMode.RAW}`;
      }
      if (!forceRaw && mode === PlayMode.DEFAULT) {
        return '';
      }
      return `profile=${mode}`;
    },
    [mode],
  );
}
