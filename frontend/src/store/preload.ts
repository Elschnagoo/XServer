import { useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectLabel,
  selectMovie,
  selectRating,
  selectRevision,
  setLabel,
  setMovie,
  setRating,
  setRevision,
} from '@/store/MovieStore';
import { useGlobalContext } from '@/context/GlobalContext';
import { SearchOrder, Sync } from '@/component/SearchModal';

export default function usePreload() {
  const context = useGlobalContext();
  const dispatch = useDispatch();
  const label = useAppSelector(selectLabel);
  const movie = useAppSelector(selectMovie);
  const rating = useAppSelector(selectRating);
  const revision = useAppSelector(selectRevision);
  const loadLabel = useCallback(() => {
    context
      .getLabels()
      .then((res) => {
        dispatch(setLabel(res.data || []));
      })
      .catch(() => {
        dispatch(setLabel([]));
      });
  }, [context, dispatch]);
  const loadRating = useCallback(() => {
    context
      .getRating()
      .then((res) => {
        dispatch(setRating(res.data || []));
      })
      .catch(() => {
        dispatch(setRating([]));
      });
  }, [context, dispatch]);
  const loadMovie = useCallback(
    (search?: any, rev = false) => {
      const min: string | undefined = Number.isInteger(search?.min)
        ? `${search?.min}`
        : undefined;
      const max: string | undefined = Number.isInteger(search?.max)
        ? `${search?.max}`
        : undefined;
      const l: string | undefined =
        search?.label && search.label.length > 0
          ? search.label.join(';')
          : undefined;
      const e: string | undefined =
        search?.exclude && search.exclude.length > 0
          ? search.exclude.join(';')
          : undefined;

      context
        .getMovies(l, e, min, max)
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

          switch (search?.link) {
            case 'has':
              data = data?.filter((c) => !!c.movie_url);
              break;
            case 'hasnot':
              data = data?.filter((c) => !c.movie_url);
              break;
            case 'default':
            default:
          }

          if (search?.titel) {
            data = data?.filter((c) => {
              return (
                c.movie_name
                  .toLowerCase()
                  .includes(search.titel.toLowerCase()) ||
                search.titel === c.e_id
              );
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
                a.movie_name.localeCompare(b.movie_name),
              );
              break;
            case SearchOrder.NAME_DSC:
              data = data.sort((a, b) =>
                b.movie_name.localeCompare(a.movie_name),
              );
              break;
            case SearchOrder.DURATION_ASC:
              data = data.sort((a, b) => (a.duration || 0) - (b.duration || 0));
              break;
            case SearchOrder.DURATION_DSC:
              data = data.sort((a, b) => (b.duration || 0) - (a.duration || 0));
              break;
            case SearchOrder.SHUFFLE:
              data = data.sort(() => 0.5 - Math.random());
              break;
            case SearchOrder.DATE_ASC:
              data = data.sort(
                (a, b) =>
                  new Date(a.created).getTime() - new Date(b.created).getTime(),
              );
              break;

            case SearchOrder.PLAYS_ASC:
              data = data.sort(
                (a, b) => (a.played_count || 0) - (b.played_count || 0),
              );
              break;
            case SearchOrder.PLAYS_DSC:
              data = data.sort(
                (a, b) => (b.played_count || 0) - (a.played_count || 0),
              );
              break;
            case SearchOrder.LAST_PLAYED_ASC:
              data = data.sort(
                (a, b) =>
                  new Date(a.last_played || 0).getTime() -
                  new Date(b.last_played || 0).getTime(),
              );
              break;
            case SearchOrder.LAST_PLAYED_DSC:
              data = data.sort(
                (a, b) =>
                  new Date(b.last_played || 0).getTime() -
                  new Date(a.last_played || 0).getTime(),
              );
              break;
            case SearchOrder.DATE_DSC:
            default:
              break;
          }
          dispatch(setMovie(data));
          if (rev) {
            dispatch(setRevision(revision + 1));
          }
        })
        .catch(() => {
          dispatch(setMovie([]));
        });
    },
    [context, dispatch, revision],
  );
  useEffect(() => {
    if (label === null) {
      loadLabel();
    }
  }, [label]);
  useEffect(() => {
    if (rating === null) {
      loadRating();
    }
  }, [rating]);
  useEffect(() => {
    if (movie === null) {
      loadMovie();
    }
  }, [movie]);
  return {
    loadMovie,
    loadLabel,
    loadRating,
  };
}
