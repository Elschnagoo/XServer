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
import React, { createRef, useEffect, useMemo, useState } from 'react';
import { selectCinema, setCinema } from '@/store/MovieStore';
import {
  useAppDispatch,
  useAppSelector,
  useLabelHook,
  usePlayMode,
} from '@/store';
import TitleComp from '@/component/TitleComp';
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
  const [movLabel, setMovieLabel] = useState<string[]>();

  useEffect(() => {
    if (cinema) {
      context
        .getMoviesLabel(cinema.e_id)
        .then((d) => setMovieLabel(d.data?.map((e) => e.map)));
    }
  }, [cinema, context]);

  const label = useLabelHook(movLabel || []);

  const [nextEl, loading] = useAsync(async () => {
    if (!cinema) {
      return [];
    }
    return (await context.getMovieRelated(cinema?.e_id)).data;
  }, [cinema, context]);

  const stream = useMemo(() => {
    return authHelper(
      `/movie/stream/${cinema?.e_id}?trace=${trace}${mode()}`,
      true,
    );
  }, [authHelper, cinema?.e_id, mode, trace]);
  const hasNextPage = useMemo(() => {
    return nextEl?.slice((page + 1) * 5, (page + 1) * 5 + 5).length !== 0;
  }, [nextEl, page]);
  return (
    <Grid flex flexC className={cnx('cinema-body')} gap={24} vCenter>
      <Grid flex flexC className="cinema-element">
        <Grid flex flexC className="player-comp">
          {cinema && (
            <>
              <Grid flex flexC className="player-comp--title">
                <TitleComp
                  noEdit
                  mc={{
                    mov: cinema,
                    update: () => {},
                  }}
                />
                <Grid
                  className="glx-w-full-4 glx-p-4 glx-flex-wrap"
                  flex
                  flexR
                  gap={8}
                >
                  {label?.map((l) => (
                    <Badge
                      icon={
                        (l.icon as INames | undefined) || 'IOPricetagOutline'
                      }
                      text={l.label_name}
                      color={l.color as BadgeColor | undefined}
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
            </>
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
