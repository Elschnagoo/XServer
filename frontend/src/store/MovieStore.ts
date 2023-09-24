import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Label, MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import { RatingElement } from '@elschnagoo/xserver-con';
import { RootState } from '@/store/store';
import { MODAL, MovieEnv, PlayMode } from '@/lib';

const initialAppEnv: MovieEnv = {
  search: null,
  label: null,
  exclude: null,
  movie: null,
  rating: null,
  max: 14,
  multi: [],
  modal: null,
  editMode: -1,
  revision: 0,
  mode: PlayMode.DEFAULT,
  forcePreview: false,
};

export const movState = createSlice({
  name: 'app',
  initialState: initialAppEnv,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setMovie: (state, action: PayloadAction<MovieLib[] | null>) => {
      state.movie = action.payload;
    },
    updateMovie: (state, action: PayloadAction<MovieLib>) => {
      if (state.movie) {
        const index = state.movie.findIndex(
          (m) => m.e_id === action.payload.e_id,
        );
        if (index !== -1) {
          state.movie[index] = action.payload;
        } else {
          state.movie.push(action.payload);
        }
      } else {
        state.movie = [action.payload];
      }
    },
    setLabel: (state, action: PayloadAction<Label[] | null>) => {
      state.label = action.payload;
    },
    setRating: (state, action: PayloadAction<RatingElement[] | null>) => {
      state.rating = action.payload;
    },
    setSearch: (state, action: PayloadAction<Record<string, any> | null>) => {
      state.search = action.payload;
    },
    setMax: (state, action: PayloadAction<number>) => {
      state.max = action.payload;
    },
    setModal: (state, action: PayloadAction<MODAL | null>) => {
      state.modal = action.payload;
    },
    addMulti: (state, action: PayloadAction<string>) => {
      state.multi = [...state.multi, action.payload];
    },
    removeMulti: (state, action: PayloadAction<string>) => {
      state.multi = state.multi.filter((m) => m !== action.payload);
    },
    resetMulti: (state) => {
      state.multi = [];
    },
    setMulti: (state, action: PayloadAction<string[]>) => {
      state.multi = action.payload;
    },
    setEditMode: (state, action: PayloadAction<number>) => {
      state.editMode = action.payload;
    },
    setRevision: (state, action: PayloadAction<number>) => {
      state.revision = action.payload;
    },
    setForcePreview: (state, action: PayloadAction<boolean>) => {
      state.forcePreview = action.payload;
    },
    setMode: (state, action: PayloadAction<PlayMode>) => {
      state.mode = action.payload;
    },
  },
});

export const {
  setMovie,
  setSearch,
  setLabel,
  updateMovie,
  setMax,
  setModal,
  addMulti,
  removeMulti,
  setMulti,
  setEditMode,
  resetMulti,
  setRevision,
  setMode,
  setForcePreview,
  setRating,
} = movState.actions;

export const selectSearch = (state: RootState) => state.movie.search;
export const selectMax = (state: RootState) => state.movie.max;
export const selectForcePreview = (state: RootState) =>
  state.movie.forcePreview;
export const selectMode = (state: RootState) => state.movie.mode;
export const selectLabel = (state: RootState) => state.movie.label;
export const selectRating = (state: RootState) => state.movie.rating;
export const selectMovie = (state: RootState) => state.movie.movie;
export const selectMulti = (state: RootState) => state.movie.multi;
export const selectModal = (state: RootState) => state.movie.modal;
export const selectEditMode = (state: RootState) => state.movie.editMode;
export const selectRevision = (state: RootState) => state.movie.revision;
