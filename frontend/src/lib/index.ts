import { Label, MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';

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
  'LABEL',
  'DOWNLOAD',
  'BULK_LABEL',
  'BULK_RATING',
  'LIB',
}

export type MovieEnv = {
  search: Record<string, any> | null;
  label: Label[] | null;
  exclude: Label[] | null;
  movie: MovieLib[] | null;
  max: number;
  multi: string[];
  modal: MODAL | null;
  editMode: number;
  revision: number;
};
