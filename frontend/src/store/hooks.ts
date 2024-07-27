import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { AppDispatch, RootState } from './store';
import { selectLabel, selectMode } from '@/store/MovieStore';
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
        return `&profile=${PlayMode.RAW}`;
      }
      if (!forceRaw && mode === PlayMode.DEFAULT) {
        return '';
      }
      return `&profile=${mode}`;
    },
    [mode],
  );
}

export function useLabelHook(labelList: string[]) {
  const label = useAppSelector(selectLabel);

  return useMemo(() => {
    return labelList
      .map((e) => {
        return (
          label?.find((x) => x.e_id === e) || {
            e_id: e,
            label_name: 'Missing',
            label_order: 0,
          }
        );
      })
      .sort((a, b) => a.label_order - b.label_order);
  }, [label, labelList]);
}
