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

export type MovieEnv = {
  search: Record<string, any> | null;
  label: Label[] | null;
  exclude: Label[] | null;
  movie: MovieLib[] | null;
  max: number;
};
