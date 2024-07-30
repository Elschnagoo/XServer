import React, {
  createRef,
  ElementRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import {
  CheckBox,
  copyToClipboard,
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
  MediaPlayer,
  MediaPlayerRefType,
  Tooltip,
  useUIContext,
  uuid,
} from '@grandlinex/react-components';
import moment from 'moment';

import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import useAuthHelper from '@/utils/AuthUtil';
import { useGlobalContext } from '@/context/GlobalContext';
import DurationComp from '@/component/DurationComp';
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

export type MovieComRefType = ElementRef<typeof MovieComp>;

const MovieComp = forwardRef<
  {
    togglePlay(): void;
    toggleStar(): void;
    toggleLabel(): void;
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
  const [editLabel, setEditLabel] = useState<boolean>(false);
  const [suggest, setSuggest] = useState<boolean>(prop.suggest || false);
  const [editStar, setEditStar] = useState<boolean>(editMode || false);

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
    toggleLabel() {
      setEditLabel(!editLabel);
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

  const thumbs = useMemo<[string, string][]>(() => {
    const comps = ['tn_1', 'tn_2', 'tn_3', 'tn_4', 'tn_5'];
    return comps.map((dx) => {
      return [dx, authHelper(`/movie/img/${mov.e_id}?type=${dx}`, true)];
    });
  }, [authHelper, mov.e_id]);

  const isSupported = useMemo(() => {
    return !!localLib.video?.supported && !!localLib.audio?.supported;
  }, [localLib]);

  const stream = useMemo(() => {
    return authHelper(
      `/movie/stream/${mov.e_id}?trace=${trace || uuid()}${mode()}`,
      true,
    );
  }, [authHelper, mode, mov.e_id, trace]);

  const update = useCallback(
    (lib: MovieLib) => {
      const n = {
        ...localLib,
        ...lib,
      };
      setLocalLib(n);
      dispatch(updateMovie(n));
      refreshUpdateKey(uuid());
    },
    [localLib],
  );

  return (
    <Grid className="movie-com">
      {!editMode && (
        <TitleComp
          mc={{
            update,
            mov,
          }}
        />
      )}
      {/* eslint-disable-next-line no-nested-ternary */}
      {play ? (
        editMode ? (
          <MediaPlayer
            key={`${mov.e_id}_player`}
            ref={playerRef}
            autoplay
            controls
            src={stream}
            onPlay={() => {
              if (playerRef.current && doubleTime) {
                playerRef.current.setPlayBackRate(2.0);
              }
            }}
          />
        ) : (
          <Grid flex flexC hCenter vCenter>
            <MediaPlayer
              key={`${mov.e_id}_player`}
              ref={playerRef}
              autoplay
              controls
              src={stream}
              onPlay={() => {
                if (playerRef.current && doubleTime) {
                  playerRef.current.setPlayBackRate(2.0);
                }
              }}
            />
          </Grid>
        )
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

      <Grid
        flex
        flexR
        flexSpaceB
        className="glx-p-8 glx-flex-wrap"
        hCenter
        vCenter
        gap={8}
      >
        <b>{localLib.video?.quality}p</b>

        {localLib.rating !== null ? (
          <b>
            <IOStar /> {localLib.rating}
          </b>
        ) : null}

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
        <DurationComp dur={localLib.duration} />
        <Tooltip
          className="hide-on-mobile"
          position="bottom"
          text={
            <Grid>
              <div>
                Created: {moment(localLib.created).format('DD.MM.YY - HH:mm')}
              </div>
              <div>
                Codec: {localLib.video?.code}+{localLib.audio?.code}
              </div>
              <div>
                Size: {Math.trunc((localLib.size || 0) / 1024 / 1024)}MB
              </div>
              <div>Plays: {localLib.played_count ?? 0}</div>
              <div>
                Last Played:
                {localLib.last_played
                  ? new Date(localLib.last_played).toLocaleString()
                  : 'never'}
              </div>
            </Grid>
          }
        >
          {isSupported ? <IOFlash /> : <IOFlashOff />}
        </Tooltip>

        <IconButton onClick={() => setEditLabel(!editLabel)}>
          {editLabel ? (
            <span className="icon-active">
              <IOPricetag />
            </span>
          ) : (
            <IOPricetag />
          )}
        </IconButton>

        <IconButton onClick={() => setEditStar(!editStar)}>
          {editStar ? (
            <span className="icon-active">
              <IOSparkles />
            </span>
          ) : (
            <IOSparkles />
          )}
        </IconButton>

        {play ? (
          <IconButton onClick={() => setPlay(!play)}>
            <span className="icon-active">
              <IOEyeOffOutline />
            </span>
          </IconButton>
        ) : null}
        {isSupported && !play ? (
          <IconButton onClick={() => setPlay(!play)}>
            <IOPlay />
          </IconButton>
        ) : null}
        {!isSupported && !play ? (
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
                      update(r.data);
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
      <Grid
        style={{
          flexDirection: 'row-reverse',
        }}
      >
        <LabelComp
          key={`label_${updateKey}`}
          edit={editLabel}
          suggest={suggest}
          focus={false}
          mc={{
            update,
            mov,
          }}
        />

        {editMode && !ui.tooltipDisabled ? (
          createPortal(
            <>
              {findMatch && (
                <Grid className="overlay-left">
                  <FindMatchComp
                    mc={{
                      update,
                      mov,
                    }}
                  />
                </Grid>
              )}
              {editStar && (
                <Grid className="overlay-right">
                  <RatingComp
                    mc={{
                      update,
                      mov,
                    }}
                    option={{
                      close: () => {
                        if (!editMode) {
                          setEditStar(false);
                        }
                      },
                    }}
                  />
                </Grid>
              )}
            </>,
            document.getElementById('mount')!,
          )
        ) : (
          <Grid flex flexC gap={12}>
            {findMatch && (
              <FindMatchComp
                mc={{
                  update,
                  mov,
                }}
              />
            )}
            {editStar && (
              <RatingComp
                mc={{
                  update,
                  mov,
                }}
                option={{
                  close: () => {
                    if (!editMode) {
                      setEditStar(false);
                    }
                  },
                }}
              />
            )}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
});

export default MovieComp;
