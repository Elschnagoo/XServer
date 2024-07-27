import {
  Label,
  MovieLib,
  RatingElement,
} from '@elschnagoo/xserver-con/dist/ApiTypes';

export enum Views {
  'LOGIN',
  'HOME',
}

export type AppEnv = {
  login: boolean;
  isNew: boolean;
  userName: string;
  userId: string;
  init: boolean;
  view: Views;
  connected: boolean;
  token: string;
  endpoint: string;
};

export enum MODAL {
  'MULTI_VIEW',
  'SEARCH',
  'BULK_LABEL',
  'BULK_RATING',
  'BULK_DELETE',
  'SETTINGS',
}
export enum PlayMode {
  'DEFAULT' = 'default',
  'RAW' = 'raw',
  'BEST' = 'best',
  'MEDIUM' = 'medium',
  'LOW' = 'low',
}

export type MovieEnv = {
  search: Record<string, any> | null;
  label: Label[] | null;
  rating: RatingElement[] | null;
  exclude: Label[] | null;
  movie: MovieLib[] | null;
  cinema: MovieLib | null;
  max: number;
  page: number;
  loading: boolean;
  lastPage: boolean;
  multi: string[];
  modal: MODAL | null;
  editMode: number;
  revision: number;
  mode: PlayMode;
  forcePreview: boolean;
  forceSuggest: boolean;
  videoQuery: string;
};

export type MovieProperties = {
  mc: {
    mov: MovieLib;
    update: (m: MovieLib) => void;
  };
};
