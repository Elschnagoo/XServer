import React, { useContext } from 'react';
import { MovieLib } from '@elschnagoo/xserver-con';

export class MovieDataContext {
  mov: MovieLib;

  update: (mov: MovieLib) => void;

  constructor(conf: { mov: MovieLib; update: (mov: MovieLib) => void }) {
    this.mov = conf.mov;
    this.update = conf.update;
  }
}

const MovieContext = React.createContext<MovieDataContext>(
  new MovieDataContext({
    mov: {
      e_id: 'dev',
      lib: 'dev',
      movie_name: 'dev',
      created: '',
      synced: false,
      disabled: false,
      lib_file: 'dev',
    },
    update: () => {},
  }),
);

const useMovieContext = () => {
  return useContext(MovieContext);
};

export default MovieContext;

export { useMovieContext };
