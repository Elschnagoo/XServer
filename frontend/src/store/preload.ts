import { useDispatch } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { GetMoviesRequestBody } from '@elschnagoo/xserver-con';
import { Simulate } from 'react-dom/test-utils';
import { useAppSelector } from '@/store/hooks';
import {
  selectLabel,
  selectLastPage,
  selectLoading,
  selectMovie,
  selectPage,
  selectRating,
  selectRevision,
  selectSearch,
  setLabel,
  setLastPage,
  setLoading,
  setMax,
  setMovie,
  setPage,
  setRating,
  setRevision,
} from '@/store/MovieStore';
import { useGlobalContext } from '@/context/GlobalContext';
import { Sync } from '@/component/SearchModal';

export function useLoader() {
  const context = useGlobalContext();
  const dispatch = useDispatch();
  const label = useAppSelector(selectLabel);
  const search = useAppSelector(selectSearch);
  const movie = useAppSelector(selectMovie);
  const rating = useAppSelector(selectRating);
  const page = useAppSelector(selectPage);
  const lastpage = useAppSelector(selectLastPage);
  const loading = useAppSelector(selectLoading);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (rating === null) {
      context
        .getRating()
        .then((res) => {
          dispatch(setRating(res.data || []));
        })
        .catch(() => {
          dispatch(setRating([]));
        });
    }
  }, [context, dispatch, rating]);

  useEffect(() => {
    if (label === null) {
      context
        .getLabels()
        .then((res) => {
          dispatch(setLabel(res.data || []));
        })
        .catch(() => {
          dispatch(setLabel([]));
        });
    }
  }, [context, dispatch, label]);

  useEffect(() => {
    (async () => {
      if ((movie === null || loading) && !running) {
        if (lastpage) {
          return;
        }
        if (!loading) {
          setLoading(true);
        }
        setRunning(true);

        const lConv = (i: string[] | undefined) => {
          if (!i || i.length === 0) {
            return undefined;
          }
          return i.join(';');
        };

        try {
          const body: GetMoviesRequestBody = {
            needLabel: lConv(search?.needLabel),
            optLabel: lConv(search?.optLabel),
            notLabel: lConv(search?.notLabel),
            ratingMin: search?.ratingMin,
            ratingMax: search?.ratingMax,
            duration: search?.duration,
            page,
            title: search?.title || undefined,
            sortOrder: search?.sortOrder || undefined,
          };
          switch (search?.syc) {
            case Sync.DONE:
              body.isSynced = true;
              break;
            case Sync.PENDING:
              body.isSynced = false;
              break;
            case Sync.ALL:
            default:
              break;
          }
          switch (search?.link) {
            case 'has':
              body.hasLink = true;
              break;
            case 'hasnot':
              body.hasLink = false;
              break;
            case 'default':
            default:
          }
          const res = await context.getMovies(body);

          const data = res.data?.data || [];
          const maxData = res.data?.count || 0;

          if (page > 0) {
            const ndat = [...(movie || []), ...data];
            if (ndat.length >= maxData) {
              dispatch(setLastPage(true));
            }
            dispatch(setMovie(ndat));
          } else {
            if (data.length >= maxData) {
              dispatch(setLastPage(true));
            }
            dispatch(setMovie(data));
          }

          dispatch(setMax(res.data?.count || data.length));
        } catch (err) {
          console.error(err);
          dispatch(setMovie([]));
        }
        setRunning(false);
        dispatch(setLoading(false));
      }
    })();
  }, [context, dispatch, lastpage, loading, movie, page, running, search]);
}
export default function usePreload() {
  const dispatch = useDispatch();
  const revision = useAppSelector(selectRevision);
  const loading = useAppSelector(selectLoading);

  const page = useAppSelector(selectPage);

  const loadMoviePage = useCallback(async () => {
    if (!loading) {
      dispatch(setPage(page + 1));
      dispatch(setLoading(true));
    }
  }, [dispatch, loading, page]);

  const loadLabel = useCallback(async () => {
    dispatch(setLabel(null));
  }, [dispatch]);
  const loadRating = useCallback(async () => {
    dispatch(setRating(null));
  }, [dispatch]);

  const clearLoadMovie = useCallback(
    async (rev?: boolean) => {
      dispatch(setMax(0));
      dispatch(setPage(0));
      dispatch(setLastPage(false));
      if (rev) {
        dispatch(setRevision(revision + 1));
      }
      dispatch(setMovie(null));
    },
    [dispatch, revision],
  );

  return {
    loadMoviePage,
    loadLabel,
    loadRating,
    clearLoadMovie,
  };
}
