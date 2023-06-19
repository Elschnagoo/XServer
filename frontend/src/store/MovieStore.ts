import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Label, MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import { RootState } from '@/store/store';
import { MovieEnv } from '@/lib';

const initialAppEnv: MovieEnv = {
  search: null,
  label: null,
  movie: null,
  max: 14,
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
          (m) => m.e_id === action.payload.e_id
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
    setSearch: (state, action: PayloadAction<Record<string, any> | null>) => {
      state.search = action.payload;
    },
    setMax: (state, action: PayloadAction<number>) => {
      state.max = action.payload;
    },
  },
});

export const { setMovie, setSearch, setLabel, updateMovie, setMax } =
  movState.actions;

export const selectSearch = (state: RootState) => state.movie.search;
export const selectMax = (state: RootState) => state.movie.max;
export const selectLabel = (state: RootState) => state.movie.label;
export const selectMovie = (state: RootState) => state.movie.movie;
