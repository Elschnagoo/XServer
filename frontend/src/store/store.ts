import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { appState } from '@/store';
import { movState } from '@/store/MovieStore';

// APP STORE

export const store = configureStore({
  reducer: {
    app: appState.reducer,
    movie: movState.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
