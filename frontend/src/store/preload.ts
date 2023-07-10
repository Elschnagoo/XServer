import { useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectLabel,
  selectMovie,
  setLabel,
  setMovie,
} from '@/store/MovieStore';
import { useGlobalContext } from '@/context/GlobalContext';
import { SearchOrder, Sync } from '@/component/SearchModal';

export default function usePreload() {
  const context = useGlobalContext();
  const dispatch = useDispatch();
  const label = useAppSelector(selectLabel);
  const movie = useAppSelector(selectMovie);

  const loadLabel = useCallback(() => {
    context
      .getLabels()
      .then((res) => {
        dispatch(setLabel(res.data || []));
      })
      .catch(() => {
        dispatch(setLabel([]));
      });
  }, []);
  const loadMovie = useCallback((search?: any) => {
    const r: string | undefined = Number.isInteger(search?.rating)
      ? `${search?.rating}`
      : undefined;
    const l: string | undefined =
      search?.label && search.label.length > 0
        ? search.label.join(';')
        : undefined;

    context
      .getMovies(l, r)
      .then((res) => {
        let data = res.data || [];

        switch (search?.syc) {
          case Sync.DONE:
            data = data?.filter((c) => c.synced);
            break;
          case Sync.PENDING:
            data = data?.filter((c) => !c.synced);
            break;
          case Sync.ALL:
          default:
            break;
        }

        if (search?.titel) {
          data = data?.filter((c) => {
            return c.movie_name
              .toLowerCase()
              .includes(search.titel.toLowerCase());
          });
        }
        switch (search?.order) {
          case SearchOrder.RATING_DSC:
            data = data.sort((a, b) => {
              const ar = a.rating || 0;
              const br = b.rating || 0;
              return br - ar;
            });
            break;
          case SearchOrder.RATING_ASC:
            data = data.sort((a, b) => {
              const ar = a.rating || 6;
              const br = b.rating || 6;
              return ar - br;
            });
            break;
          case SearchOrder.NAME_ASC:
            data = data.sort((a, b) =>
              a.movie_name.localeCompare(b.movie_name)
            );
            break;
          case SearchOrder.NAME_DSC:
            data = data.sort((a, b) =>
              b.movie_name.localeCompare(a.movie_name)
            );
            break;
          case SearchOrder.DURATION_ASC:
            data = data.sort((a, b) => (a.duration || 0) - (b.duration || 0));
            break;
          case SearchOrder.DURATION_DSC:
            data = data.sort((a, b) => (b.duration || 0) - (a.duration || 0));
            break;
          case SearchOrder.SHUFFLE:
            data = data.sort((a, b) => 0.5 - Math.random());
            break;
          case SearchOrder.DATE_ASC:
            data = data.sort(
              (a, b) =>
                new Date(a.created).getTime() - new Date(b.created).getTime()
            );
            break;
          case SearchOrder.DATE_DSC:
          default:
            break;
        }
        dispatch(setMovie(data));
      })
      .catch(() => {
        dispatch(setMovie([]));
      });
  }, []);
  useEffect(() => {
    if (label === null) {
      loadLabel();
    }
  }, [label]);
  useEffect(() => {
    if (movie === null) {
      loadMovie();
    }
  }, [movie]);
  return {
    loadMovie,
    loadLabel,
  };
}
