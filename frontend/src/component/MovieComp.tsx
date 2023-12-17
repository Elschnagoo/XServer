import React, {
  createRef,
  ElementRef,
  forwardRef,
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
} from '@grandlinex/react-components';
import moment from 'moment';
import {
  MediaPlayer,
  MediaPlayerRefType,
} from '@grandlinex/react-components/dist/components/mediaPlayer/MediaPlayer';
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
  setEditMode,
  updateMovie,
} from '@/store/MovieStore';
import VideoPreview from '@/component/VideoPreview';
import RatingComp from '@/component/RatingComp';

const SupportedWebVideoCodec = ['h264', 'vp8', 'vp9'];

const SupportedWebVideoContainer = ['mov,mp4,m4a,3gp,3g2,mj2', 'matroska,webm'];

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
  } = prop;
  const ui = useUIContext();
  const dispatch = useAppDispatch();
  const playerRef = createRef<MediaPlayerRefType>();
  const forcePreview = useAppSelector(selectForcePreview);
  const [localLib, setLocalLib] = useState<MovieLib>(mov);
  const mode = usePlayMode();
  const context = useGlobalContext();
  const [play, setPlay] = useState<boolean>(!!forcePlay);
  const [editLabel, setEditLabel] = useState<boolean>(
    (!!editMode && !prop.suggest) || false,
  );
  const [suggest, setSuggest] = useState<boolean>(
    editMode || prop.suggest || false,
  );
  const [editStar, setEditStar] = useState<boolean>(editMode || false);
  const [playerStatus, setPlayerstatus] =
    useState<PlayerUpdateEvent<any> | null>(null);

  const has = useMemo(
    () => !!multi?.list.includes(mov.e_id),
    [mov.e_id, multi],
  );
  const updateL = (lib: MovieLib) => {
    setLocalLib(lib);
    dispatch(updateMovie(lib));
  };

  useImperativeHandle(ref, () => ({
    updateLib(lib: MovieLib) {
      updateL(lib);
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
    if (!inspection) {
      return null;
    }
    const vid = inspection.streams.find((dx) => dx.codec_type === 'video')!;
    const web =
      SupportedWebVideoCodec.includes(vid.codec_name) &&
      SupportedWebVideoContainer.includes(inspection.format.format_name);
    return {
      duration: mov.duration || 0,
      size: `${(Number(inspection.format.size) / 1024 / 1024).toFixed(2)} MB`,
      res: vid.height || 0,
      web,
      container: inspection.format.format_name,
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
  }, [authHelper, mov.e_id]);
  return (
    <Grid className="movie-com">
      <TitleComp mov={localLib} update={updateL} />
      {play ? (
        <Grid flex flexC hCenter vCenter>
          <MediaPlayer
            ref={playerRef}
            autoplay={editMode}
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
        <Grid flex vCenter gap={12} grow={1} className="glx-mr-12">
          <div>{moment(mov.created).format('DD.MM.YY - HH:mm')}</div>
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
                position="bottom"
                text={`Container: ${meta.container}\nSize: ${
                  meta.size
                }\nPlays: ${mov.played_count ?? 0}\nLast Played: ${
                  mov.last_played
                    ? new Date(mov.last_played).toLocaleString()
                    : 'never'
                }`}
              >
                {meta.web ? <IOFlash /> : <IOFlashOff />}
              </Tooltip>
            </>
          ) : null}

          <IconButton
            /* toolTip={{
                          text: 'Label bearbeiten',
                          position: 'left',
                        }} */
            onClick={() => setEditLabel(!editLabel)}
          >
            {editLabel ? (
              <span className="icon-active">
                <IOPricetag />
              </span>
            ) : (
              <IOPricetag />
            )}
          </IconButton>

          {!editMode && (
            <IconButton
              /* toolTip={{
                                text: 'Bewerten',
                                position: 'left',
                              }} */
              onClick={() => setEditStar(!editStar)}
            >
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
            <IconButton
              /* toolTip={{
                                text: 'Abspielen beenden',
                                position: 'left',
                              }} */
              onClick={() => setPlay(!play)}
            >
              <span className="icon-active">
                <IOEyeOffOutline />
              </span>
            </IconButton>
          ) : null}
          {meta?.web && !play ? (
            <IconButton
              /* toolTip={{
                                text: 'Abspielen',
                                position: 'left',
                              }} */
              onClick={() => setPlay(!play)}
            >
              <IOPlay />
            </IconButton>
          ) : null}
          {!meta?.web && !play ? (
            <IconButton
              /* toolTip={{
                                text: 'Abspielen (Konvertieren)',
                                position: 'left',
                              }} */
              onClick={() => setPlay(!play)}
            >
              <IOTvOutline />
            </IconButton>
          ) : null}

          {multi && (
            <Tooltip
              className="hide-on-mobile h-fix"
              position="left"
              text="Select for bulk action."
            >
              <CheckBox
                className="h-fix"
                checked={has}
                value={has}
                onChange={() => multi.updateMulti(mov.e_id)}
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
              ...(mov.movie_url
                ? [
                    {
                      key: 'open-original',
                      icon: 'IOOpen' as INames,
                      label: 'Open Original',
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
                key: 'suggest',
                icon: 'IOPricetags',
                label: 'Label Suggestion',
              },
              {
                key: 'delete',
                icon: 'IOTrash',
                label: 'Delete Video',
              },
            ]}
            left
            onChange={(key) => {
              switch (key) {
                case 'suggest':
                  setSuggest(!suggest);
                  break;
                case 'open-original':
                  context.openExternalConfig({
                    url: mov.movie_url!,
                    external: true,
                  });
                  break;
                case 'open':
                  context.openExternalConfig({
                    url: authHelper(
                      `/movie/stream/${mov.e_id}?${mode(true)}`,
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
                        Delete Medium [{mov.movie_name}] from File system
                      </span>
                      <Grid flex flexR gap={12} hCenter>
                        <IconButton
                          onClick={() => {
                            context.deleteMovie(mov.e_id).then((r) => {
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
        <RatingComp
          className={
            editMode && !ui.tooltipDisabled ? 'edit-rating' : undefined
          }
          option={{
            mov: localLib,
            edit: editStar,
            close: () => {
              if (!editMode) {
                setEditStar(false);
              }
            },
            update: updateL,
          }}
        />

        <LabelComp
          id={mov.e_id}
          focus={!!editMode}
          edit={editLabel}
          suggest={suggest}
          title={mov.movie_name}
        />
      </Grid>
    </Grid>
  );
});

MovieComp.defaultProps = {
  editMode: undefined,
  suggest: undefined,
  trace: undefined,
  forcePlay: undefined,
  doubleTime: undefined,
  showProgress: undefined,
  index: undefined,
  multi: undefined,
};

export default MovieComp;
