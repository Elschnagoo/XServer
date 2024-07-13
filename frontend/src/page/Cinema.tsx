import {
  Badge,
  BadgeColor,
  cnx,
  Grid,
  IconButton,
  INames,
  MediaPlayer,
  MediaPlayerRefType,
  useAsync,
  uuid,
} from '@grandlinex/react-components';
import React, { createRef, useMemo, useState } from 'react';
import { MLabel } from '@elschnagoo/xserver-con';
import { selectCinema, setCinema } from '@/store/MovieStore';
import { useAppDispatch, useAppSelector, usePlayMode } from '@/store';
import TitleComp from '@/component/TitleComp';
import MovieContext, { MovieDataContext } from '@/context/MovieContext';
import useAuthHelper from '@/utils/AuthUtil';
import CinemaPreviewComp from '@/component/CinemaPreviewComp';
import { useGlobalContext } from '@/context/GlobalContext';

export default function Cinema() {
  const context = useGlobalContext();
  const cinema = useAppSelector(selectCinema);
  const dispatch = useAppDispatch();
  const playerRef = createRef<MediaPlayerRefType>();
  const mode = usePlayMode();
  const [trace] = useState(uuid());

  const [page, setPage] = useState(0);
  const authHelper = useAuthHelper();
  const [movLabel, setMovieLabel] = useState<MLabel[]>();
  const curEl = useMemo(() => {
    if (cinema) {
      context.getMoviesLabel(cinema.e_id).then((d) => {
        setMovieLabel(
          d.data?.sort((a, b) => a.label.label_order - b.label.label_order) ||
            [],
        );
      });
      return new MovieDataContext({
        mov: cinema,
        update: () => {},
      });
    }
    return null;
  }, [cinema, context]);

  const [nextEl, loading] = useAsync(async () => {
    if (!cinema) {
      return [];
    }
    return (await context.getMovieRelated(cinema?.e_id)).data;
  }, [cinema, context]);

  const stream = useMemo(() => {
    return authHelper(
      `/movie/stream/${curEl?.mov.e_id}?trace=${trace}${mode()}`,
      true,
    );
  }, [authHelper, curEl?.mov.e_id, mode, trace]);
  const hasNextPage = useMemo(() => {
    return nextEl?.slice((page + 1) * 5, (page + 1) * 5 + 5).length !== 0;
  }, [nextEl, page]);
  return (
    <Grid flex flexC className={cnx('cinema-body')} gap={24} vCenter>
      <Grid flex flexC className="cinema-element">
        <Grid flex flexC className="player-comp">
          {curEl && (
            <MovieContext.Provider value={curEl}>
              <Grid flex flexC className="player-comp--title">
                <TitleComp noEdit />
                <Grid
                  className="glx-w-full-4 glx-p-4 glx-flex-wrap"
                  flex
                  flexR
                  gap={8}
                >
                  {movLabel?.map((l) => (
                    <Badge
                      icon={
                        (l.label.icon as INames | undefined) ||
                        'IOPricetagOutline'
                      }
                      text={l.label.label_name}
                      color={l.label.color as BadgeColor | undefined}
                    />
                  ))}
                </Grid>
              </Grid>
              <MediaPlayer
                className="cinema-vid"
                ref={playerRef}
                controls
                autoplay
                src={stream}
                onEnded={() => {
                  dispatch(setCinema(nextEl?.[5 * page] || null));
                  setPage(0);
                }}
              />
            </MovieContext.Provider>
          )}
        </Grid>
        <Grid flex flexR className="play-candidates" flexSpaceA>
          {nextEl?.slice(5 * page, page * 5 + 5).map((value) => (
            <CinemaPreviewComp
              key={value.e_id}
              mov={value}
              onClick={() => {
                dispatch(setCinema(value));
                setPage(0);
              }}
              trace={trace}
            />
          ))}
          {!loading && page !== 0 && (
            <div className="aps-left">
              <IconButton
                icon="IOChevronBack"
                onClick={() => {
                  setPage(page - 1);
                }}
              />
            </div>
          )}
          {!loading && hasNextPage && (
            <div className="aps-right">
              <IconButton
                icon="IOChevronForward"
                onClick={() => {
                  setPage(page + 1);
                }}
              />
            </div>
          )}
          {loading && (
            <>
              <div className="cinema-preview-empty" />
              <div className="cinema-preview-empty" />
              <div className="cinema-preview-empty" />
              <div className="cinema-preview-empty" />
              <div className="cinema-preview-empty" />
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
