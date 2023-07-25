import React, {
  createRef,
  ElementRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Label, MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import {
  DropDownIconMenu,
  Grid,
  HNavigator,
  IconButton,
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
  Tooltip,
  useQData,
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
import StarComp from '@/component/StarComp';
import TitleComp from '@/component/TitleComp';
import { useAppDispatch } from '@/store';
import { updateMovie } from '@/store/MovieStore';
import ImgCarousel from '@/component/ImgCarousel';
import CheckBox from '@/component/CheckBox';

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
    label: Label[];
    reload: () => void;
    editMode?: boolean;
    multi?: {
      updateMulti: (id: string) => void;
      list: string[];
    };
  }
>((prop, ref) => {
  const { mov, label, editMode, reload, multi } = prop;
  const dispatch = useAppDispatch();
  const playerRef = createRef<MediaPlayerRefType>();
  const [localLib, setLocalLib] = useState<MovieLib>(mov);
  const context = useGlobalContext();
  const [play, setPlay] = useState<boolean>(false);
  const [editLabel, setEditLabel] = useState<boolean>(editMode || false);
  const [editStar, setEditStar] = useState<boolean>(editMode || false);

  const has = useMemo(
    () => !!multi?.list.includes(mov.e_id),
    [mov.e_id, multi],
  );
  const updateL = useCallback(
    (lib: MovieLib) => {
      setLocalLib(lib);
      dispatch(updateMovie(lib));
    },
    [dispatch],
  );
  /* const update = useCallback(() => {
    context.getMovie(localLib.e_id).then((res) => {
      if (res.success && res.data) {
        updateL(res.data);
      } else {
        toast.error('Fehler beim Aktualisieren der Daten');
      }
    });
  }, [context, localLib.e_id, updateL]); */

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
    return authHelper(`/movie/stream/${mov.e_id}`, true);
  }, [authHelper, mov.e_id]);
  return (
    <Grid className="movie-com">
      <TitleComp mov={localLib} update={updateL} />
      {play ? (
        <Grid flex flexC hCenter vCenter>
          <MediaPlayer ref={playerRef} autoplay={editMode} src={stream} />
        </Grid>
      ) : (
        <div className="carosell-container">
          <div className="play" onClick={() => setPlay(true)}>
            <IOPlay />
          </div>
          <HNavigator className="carosell">
            <Grid flex flexR>
              {!editMode ? <ImgCarousel data={thumbs} /> : null}
              {thumbs.map(([key, dx]) => (
                <img key={key} loading="lazy" alt="" src={dx} />
              ))}
            </Grid>
          </HNavigator>
        </div>
      )}

      <Grid flex flexR flexSpaceB className="glx-p-8 glx-flex-wrap" hCenter>
        <Grid flex vCenter>
          {moment(mov.created).format('DD.MM.YY - HH:mm')}
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
              <Tooltip position="left" text={`${meta.size} ${meta.container}`}>
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
              className="hide-on-mobile"
              position="left"
              text={
                multi.list.length >= 4 && !has ? '' : 'Select for multi play'
              }
            >
              <CheckBox
                disabled={multi.list.length >= 4 && !has}
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
              {
                key: 'delete',
                icon: 'IOTrash',
                label: 'Delete Video',
              },
            ]}
            left
            onChange={(key) => {
              switch (key) {
                case 'open':
                  context.openExternalConfig({
                    url: authHelper(
                      `/movie/stream/${mov.e_id}?profile=raw`,
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
        flex={editMode}
      >
        <StarComp
          mov={localLib}
          edit={editStar}
          update={updateL}
          close={() => setEditStar(false)}
        />
        <LabelComp
          label={label}
          id={mov.e_id}
          focus={!!editMode}
          edit={editLabel}
        />
      </Grid>
    </Grid>
  );
});

MovieComp.defaultProps = {
  editMode: undefined,
  multi: undefined,
};

export default MovieComp;
