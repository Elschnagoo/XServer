import React, {
  createRef,
  ElementRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import {
  CheckBox,
  DropDownIconMenu,
  Grid,
  HNavigator,
  IconButton,
  INames,
  IOCheckmark,
  IOClose,
  IOEyeOffOutline,
  IOFlash,
  IOFlashOff,
  IOLink,
  IOPlay,
  IOPricetag,
  IOSparkles,
  IOStar,
  IOTrash,
  IOTvOutline,
  PlayerUpdateEvent,
  Progress,
  Tooltip,
  useQData,
  useUIContext,
  uuid,
  MediaPlayer,
  MediaPlayerRefType,
  copyToClipboard,
} from '@grandlinex/react-components';
import moment from 'moment';

import { toast } from 'react-toastify';
import useAuthHelper from '@/utils/AuthUtil';
import { useGlobalContext } from '@/context/GlobalContext';
import DurationComp from '@/component/DurationComp';
import { ProbeInfo } from '@/lib/MediaHandlerTypes';
import LabelComp from '@/component/LabelComp';
import TitleComp from '@/component/TitleComp';
import { useAppDispatch, useAppSelector, usePlayMode } from '@/store';
import {
  selectForcePreview,
  setCinema,
  setEditMode,
  updateMovie,
} from '@/store/MovieStore';
import VideoPreview from '@/component/VideoPreview';
import RatingComp from '@/component/RatingComp';
import FindMatchComp from '@/component/FindMatchComp';
import MovieContext, { MovieDataContext } from '@/context/MovieContext';

export type MovieComRefType = ElementRef<typeof MovieComp>;

const MovieComp = forwardRef<
  {
    togglePlay(): void;
    toggleStar(): void;
    seekForward(): void;
    seekBack(): void;
    updateLib(lib: MovieLib): void;
  },
  {
    mov: MovieLib;
    reload: () => void;
    editMode?: boolean;
    suggest?: boolean;
    trace?: string;
    forcePlay?: boolean;
    doubleTime?: boolean;
    showProgress?: boolean;
    autoFindMatch?: boolean;
    index?: number;
    multi?: {
      updateMulti: (id: string) => void;
      list: string[];
    };
  }
>((prop, ref) => {
  const {
    mov,
    editMode,
    reload,
    trace,
    multi,
    forcePlay,
    doubleTime,
    showProgress,
    index,
    autoFindMatch,
  } = prop;
  const ui = useUIContext();
  const [updateKey, refreshUpdateKey] = useState(uuid());
  const dispatch = useAppDispatch();
  const playerRef = createRef<MediaPlayerRefType>();
  const forcePreview = useAppSelector(selectForcePreview);
  const [localLib, setLocalLib] = useState<MovieLib>(mov);
  const mode = usePlayMode();
  const context = useGlobalContext();
  const [play, setPlay] = useState<boolean>(!!forcePlay);
  const [findMatch, setFindMatch] = useState<boolean>(!!autoFindMatch);
  const [editLabel, setEditLabel] = useState<boolean>(
    (!!editMode && !prop.suggest) || false,
  );
  const [suggest, setSuggest] = useState<boolean>(
    editMode || prop.suggest || false,
  );
  const [editStar, setEditStar] = useState<boolean>(editMode || false);
  const [playerStatus, setPlayerstatus] =
    useState<PlayerUpdateEvent<any> | null>(null);

  useEffect(() => {
    setFindMatch(!!autoFindMatch);
  }, [autoFindMatch]);

  const has = useMemo(
    () => !!multi?.list.includes(localLib.e_id),
    [localLib.e_id, multi],
  );

  useImperativeHandle(ref, () => ({
    updateLib(lib: MovieLib) {
      setLocalLib(lib);
      dispatch(updateMovie(lib));
      refreshUpdateKey(uuid());
    },
    togglePlay() {
      setPlay(!play);
    },
    toggleStar() {
      setEditStar(!editStar);
    },
    seekBack() {
      if (playerRef.current) {
        const cur = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(cur - 10);
      }
    },
    seekForward() {
      if (playerRef.current) {
        const cur = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(cur + 30);
      }
    },
  }));
  const authHelper = useAuthHelper();
  const [meta] = useQData<{
    duration: number;
    size: string;
    res: number;
    container: string;
    web: boolean;
    raw: ProbeInfo | undefined;
  }>(async () => {
    const inspection: ProbeInfo | undefined = (
      await context.getMovieVersion(mov.e_id)
    ).data?.file_meta;
    const test = await context.getMovieSupport(mov.e_id);
    if (!inspection) {
      return null;
    }
    const vid = inspection.streams.find((dx) => dx.codec_type === 'video')!;
    const web = !!test.data?.video?.supported && !!test.data.audio?.supported;
    return {
      duration: mov.duration || 0,
      size: `${(Number(inspection.format.size) / 1024 / 1024).toFixed(2)} MB`,
      res: vid.height || 0,
      web,
      container: `${test.data?.video?.code} + ${test.data?.audio?.code}`,
      raw: inspection,
    };
  });

  const thumbs = useMemo<[string, string][]>(() => {
    const comps = ['tn_1', 'tn_2', 'tn_3', 'tn_4', 'tn_5'];
    return comps.map((dx) => {
      return [dx, authHelper(`/movie/img/${mov.e_id}?type=${dx}`, true)];
    });
  }, [authHelper, mov.e_id]);
  const stream = useMemo(() => {
    return authHelper(
      `/movie/stream/${mov.e_id}?trace=${trace || uuid()}${mode()}`,
      true,
    );
  }, [authHelper, mode, mov.e_id, trace]);
  const mc = useMemo(
    () =>
      new MovieDataContext({
        mov,
        update: (lib: MovieLib) => {
          setLocalLib(lib);
          dispatch(updateMovie(lib));
          refreshUpdateKey(uuid());
        },
      }),
    [dispatch, mov],
  );
  return (
    <MovieContext.Provider value={mc}>
      <Grid className="movie-com">
        <TitleComp />
        {play ? (
          <Grid flex flexC hCenter vCenter>
            <MediaPlayer
              ref={playerRef}
              autoplay={editMode}
              controls
              src={stream}
              onProgress={(e) => {
                if (showProgress) {
                  setPlayerstatus(e);
                }
              }}
              onPlay={() => {
                if (playerRef.current && doubleTime) {
                  playerRef.current.setPlayBackRate(2.0);
                }
              }}
            />
          </Grid>
        ) : (
          <div key={`${mov.e_id}_carosell`} className="carosell-container">
            <div className="play" onClick={() => setPlay(true)}>
              <IOPlay />
            </div>
            <HNavigator className="carosell">
              <Grid flex flexR>
                <VideoPreview eid={mov.e_id} force={editMode || forcePreview} />
                {thumbs.map(([key, dx]) => (
                  <img key={key} loading="lazy" alt="" src={dx} />
                ))}
              </Grid>
            </HNavigator>
          </div>
        )}

        <Grid flex flexR flexSpaceB className="glx-p-8 glx-flex-wrap" hCenter>
          <Grid flex vCenter gap={8} grow={1} className="glx-mr-12">
            <div>{moment(localLib.created).format('DD.MM.YY - HH:mm')} </div>
            {localLib.movie_url && (
              <Tooltip text={localLib.movie_url}>
                <div
                  style={{
                    paddingTop: '4px',
                  }}
                >
                  <IOLink />
                </div>
              </Tooltip>
            )}
            {playerStatus ? (
              <Grid grow={1}>
                <Progress
                  cur={playerStatus.currentTime}
                  max={playerStatus.duration}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid flex flexR gap={8} hCenter vCenter>
            {localLib.rating !== null ? (
              <b>
                <IOStar /> {localLib.rating}
              </b>
            ) : null}
            {meta ? (
              <>
                <b>{meta.res}p</b>
                <DurationComp dur={meta.duration} />
                <Tooltip
                  className="hide-on-mobile"
                  position="bottom"
                  text={`Container: ${meta.container}\nSize: ${
                    meta.size
                  }\nPlays: ${localLib.played_count ?? 0}\nLast Played: ${
                    localLib.last_played
                      ? new Date(localLib.last_played).toLocaleString()
                      : 'never'
                  }`}
                >
                  {meta.web ? <IOFlash /> : <IOFlashOff />}
                </Tooltip>
              </>
            ) : null}

            <IconButton onClick={() => setEditLabel(!editLabel)}>
              {editLabel ? (
                <span className="icon-active">
                  <IOPricetag />
                </span>
              ) : (
                <IOPricetag />
              )}
            </IconButton>

            {!editMode && (
              <IconButton onClick={() => setEditStar(!editStar)}>
                {editStar ? (
                  <span className="icon-active">
                    <IOSparkles />
                  </span>
                ) : (
                  <IOSparkles />
                )}
              </IconButton>
            )}

            {play ? (
              <IconButton onClick={() => setPlay(!play)}>
                <span className="icon-active">
                  <IOEyeOffOutline />
                </span>
              </IconButton>
            ) : null}
            {meta?.web && !play ? (
              <IconButton onClick={() => setPlay(!play)}>
                <IOPlay />
              </IconButton>
            ) : null}
            {!meta?.web && !play ? (
              <IconButton onClick={() => setPlay(!play)}>
                <IOTvOutline />
              </IconButton>
            ) : null}

            {multi && (
              <Tooltip
                className="h-fix"
                position="left"
                text="Select for bulk action."
              >
                <CheckBox
                  className="h-fix"
                  checked={has}
                  value={has}
                  onChange={() => multi.updateMulti(localLib.e_id)}
                />
              </Tooltip>
            )}

            <DropDownIconMenu
              menu={[
                {
                  key: 'open',
                  icon: 'IOOpenOutline',
                  label: 'Open Video in new tab',
                },
                ...(localLib.movie_url
                  ? [
                      {
                        key: 'open-original',
                        icon: 'IOOpen' as INames,
                        label: 'Open Original',
                      },
                    ]
                  : []),
                {
                  key: 'copy-id',
                  icon: 'IOClipboard',
                  label: 'Copy Element ID',
                },
                {
                  key: 'cinema-mode',
                  icon: 'IOCamera',
                  label: 'Cinema Mode',
                },
                {
                  key: 'suggest--video',
                  icon: 'IOPricetags' as INames,
                  label: 'Video Suggestion',
                  checkBox: true,
                  value: findMatch,
                },
                {
                  key: 'suggest--label',
                  icon: 'IOPricetags',
                  label: 'Label Suggestion',
                  checkBox: true,
                  value: suggest,
                },
                ...(localLib.movie_url !== null
                  ? [
                      {
                        key: 'unlink',
                        icon: 'IOBagRemove' as INames,
                        label: 'Remove Link',
                      },
                    ]
                  : []),
                ...(index !== undefined
                  ? [
                      {
                        key: 'edit',
                        icon: 'IOServer' as INames,
                        label: 'Edit Mode',
                      },
                    ]
                  : []),
                {
                  key: 'delete',
                  icon: 'IOTrash',
                  label: 'Delete Video',
                },
              ]}
              left
              onChange={(key) => {
                switch (key) {
                  case 'copy-id':
                    copyToClipboard(localLib.e_id);
                    toast.success(`ID copied to clipboard`);
                    break;
                  case 'cinema-mode':
                    dispatch(setCinema(mov));
                    break;
                  case 'suggest--label':
                    setSuggest(!suggest);
                    break;
                  case 'suggest--video':
                    setFindMatch(!findMatch);
                    break;
                  case 'open-original':
                    context.openExternalConfig({
                      url: localLib.movie_url!,
                      external: true,
                    });
                    break;
                  case 'unlink':
                    context
                      .updateMovie(localLib.e_id, {
                        movie_url: null as any,
                      })
                      .then((r) => {
                        if (r.data) {
                          setLocalLib(r.data);
                        }
                      });
                    break;
                  case 'open':
                    context.openExternalConfig({
                      url: authHelper(
                        `/movie/stream/${localLib.e_id}?${mode(true)}`,
                        true,
                        true,
                      ),
                      external: true,
                    });

                    break;
                  case 'delete':
                    toast.dark(
                      <Grid flex flexC gap={12}>
                        <span>
                          Delete Medium [{localLib.movie_name}] from File system
                        </span>
                        <Grid flex flexR gap={12} hCenter>
                          <IconButton
                            onClick={() => {
                              context.deleteMovie(localLib.e_id).then((r) => {
                                if (r.success) {
                                  toast.success('Element deleted');
                                } else {
                                  toast.error('Error deleting element');
                                }
                                reload();
                              });
                            }}
                          >
                            <IOCheckmark />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              toast.dismiss();
                            }}
                          >
                            <IOClose />
                          </IconButton>
                        </Grid>
                      </Grid>,
                      {
                        autoClose: false,
                        icon: <IOTrash />,
                      },
                    );
                    break;
                  case 'edit':
                    if (index !== undefined) {
                      dispatch(setEditMode(index));
                    }

                    break;
                  default:
                    break;
                }
              }}
            />
          </Grid>
        </Grid>
        <Grid
          style={{
            flexDirection: 'row-reverse',
          }}
          flex={editMode && !ui.tooltipDisabled}
        >
          <LabelComp
            key={`label_${updateKey}`}
            id={localLib.e_id}
            focus={!!editMode}
            edit={editLabel}
            suggest={suggest}
            title={localLib.movie_name}
          />
          <Grid
            flex
            flexC
            gap={12}
            className={
              editMode && !ui.tooltipDisabled ? 'edit-rating' : undefined
            }
          >
            {findMatch && <FindMatchComp />}
            <RatingComp
              option={{
                edit: editStar,
                close: () => {
                  if (!editMode) {
                    setEditStar(false);
                  }
                },
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </MovieContext.Provider>
  );
});

export default MovieComp;
