import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { AppEnv, Views } from '@/lib';

const initialAppEnv: AppEnv = {
  isNew: false,
  login: false,
  connected: false,
  userName: '',
  userId: '',
  token: '',
  endpoint: '',
  init: false,
  view: Views.HOME,
};

export const appState = createSlice({
  name: 'app',
  initialState: initialAppEnv,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setLogin: (state, action: PayloadAction<boolean>) => {
      state.login = action.payload;
    },
    setIsNew: (state, action: PayloadAction<boolean>) => {
      state.isNew = action.payload;
    },
    setInit: (state, action: PayloadAction<boolean>) => {
      state.init = action.payload;
    },

    setMainView: (state, action: PayloadAction<number>) => {
      state.view = action.payload;
    },

    setAppStore: (state, action: PayloadAction<AppEnv>) => {
      state.isNew = action.payload.isNew;
      state.login = action.payload.login;
      state.userName = action.payload.userName;
      state.userId = action.payload.userId;
      state.init = action.payload.init;
      state.view = action.payload.view;
      state.token = action.payload.token;
      state.endpoint = action.payload.endpoint;
      state.connected = action.payload.connected;
    },
  },
});

export const { setInit, setMainView, setAppStore } = appState.actions;

export const selectIsInitG = (state: RootState) => state.app.init;
export const selectViewG = (state: RootState) => state.app.view;
export const selectUserName = (state: RootState) => state.app.userName;
export const selectUserId = (state: RootState) => state.app.userId;
export const selectIsNew = (state: RootState) => state.app.isNew;
export const selectLogin = (state: RootState) => state.app.login;
export const selectToken = (state: RootState) => state.app.token;
export const selectEndpoint = (state: RootState) => state.app.endpoint;
export const selectConnected = (state: RootState) => state.app.connected;
