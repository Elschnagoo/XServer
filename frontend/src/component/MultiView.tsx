import React, { createRef, useMemo } from 'react';
import {
  cnx,
  def,
  Grid,
  IconButton,
  IOClose,
  IOInformationCircleOutline,
  KeyBind,
  MediaPlayerParentFunction,
  Tooltip,
  useKeyListener,
  uuid,
} from '@grandlinex/react-components';
import {
  MediaPlayer,
  MediaPlayerRefType,
} from '@grandlinex/react-components/dist/components/mediaPlayer/MediaPlayer';
import useAuthHelper from '@/utils/AuthUtil';
import { selectMulti, setModal } from '@/store/MovieStore';
import { useAppDispatch, useAppSelector, usePlayMode } from '@/store';

function changeVol(
  ref: React.RefObject<MediaPlayerParentFunction>,
  vol: number,
) {
  const player = ref.current?.getRawPlayer() as HTMLVideoElement | undefined;
  if (player) {
    const newVol = Math.trunc(player.volume * 100) + vol;
    if (newVol >= 0 && newVol <= 100) {
      player.volume = newVol / 100;
    } else if (newVol < 0) {
      player.volume = 0;
    } else if (newVol > 100) {
      player.volume = 1;
    }
  }
}
function toggleMute(ref: React.RefObject<MediaPlayerParentFunction>) {
  const player = ref.current?.getRawPlayer() as HTMLVideoElement | undefined;
  if (player) {
    player.muted = !player.muted;
  }
}

export default function MultiView() {
  const authHelper = useAuthHelper();
  const dispatch = useAppDispatch();
  const mode = usePlayMode();

  const list = useAppSelector(selectMulti);
  const option = useMemo(() => {
    switch (list.length) {
      case 1:
        return {
          maxR: 1,
          maxC: 1,
        };
      case 2:
        return {
          maxR: 1,
          maxC: 2,
        };
      case 3:
      case 4:
        return {
          maxR: 2,
          maxC: 2,
        };
      case 5:
      case 6:
        return {
          maxR: 2,
          maxC: 3,
        };
      case 7:
      case 8:
      case 9:
        return {
          maxR: 3,
          maxC: 3,
        };
      case 10:
      case 11:
      case 12:
        return {
          maxR: 3,
          maxC: 4,
        };
      case 13:
      case 14:
      case 15:
      case 16:
        return {
          maxR: 4,
          maxC: 4,
        };
      case 17:
      case 18:
      case 19:
      case 20:
      default:
        return {
          maxR: 4,
          maxC: 5,
        };
    }
  }, [list.length]);
  const pList = useMemo(() => {
    return list
      .map<
        [string, string, string, React.RefObject<MediaPlayerParentFunction>]
      >((v) => [v, authHelper(`/movie/stream/${v}?trace=${uuid()}${mode()}`, true), authHelper(`/movie/img/${v}?type=tn_1`, true), createRef<MediaPlayerRefType>()])
      .slice(0, option.maxR * option.maxC);
  }, [authHelper, list, mode, option.maxC, option.maxR]);

  const keyListerner = useMemo<(KeyBind & { description?: string })[]>(
    () => [
      {
        key: {
          primary: 'ctrl',
          secondary: 'ArrowDown',
        },
        description: 'Pause',
        action: () => {
          pList.forEach(([, , , ref]) => {
            ref.current?.pause();
          });
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'ArrowUp',
        },
        description: 'Play',
        action: () => {
          pList.forEach(([, , , ref]) => {
            ref.current?.play();
          });
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'ArrowRight',
        },
        description: 'Seek forward',
        action: () => {
          pList.forEach(([, , , ref]) => {
            ref.current?.pause();
            const cur = ref.current?.getCurrentTime() ?? 0;
            ref.current?.seekTo(cur + 10);
          });
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'ArrowLeft',
        },
        description: 'Seek back',
        action: () => {
          pList.forEach(([, , , ref]) => {
            ref.current?.pause();
            const cur = ref.current?.getCurrentTime() ?? 0;
            ref.current?.seekTo(cur - 10);
          });
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'KeyM',
        },
        description: 'Seek back',
        action: () => {
          pList.forEach(([, , , ref]) => {
            toggleMute(ref);
          });
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'KeyL',
        },
        description: 'Vol up',
        action: () => {
          pList.forEach(([, , , ref]) => {
            changeVol(ref, 5);
          });
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'KeyK',
        },
        description: 'Vol down',
        action: () => {
          pList.forEach(([, , , ref]) => {
            changeVol(ref, -5);
          });
        },
      },
    ],
    [pList],
  );
  const tText = useMemo(
    () =>
      [
        'Shortcuts:',
        ...keyListerner
          .filter((e) => !!e.description)
          .map(
            (k) => `${k.key.primary} + ${k.key.secondary}: ${k.description}`,
          ),
      ].join('\n'),
    [keyListerner],
  );
  useKeyListener(keyListerner);

  return (
    <>
      <Grid flex flexR className="multi-view glx-flex-wrap">
        {pList.map(([id, steam, poster, ref], index, el) => (
          <div
            id={`${id}_steam`}
            key={`${id}_steam`}
            className={cnx(
              [el.length === 1, 'multi-el-single'],
              [el.length === 2, 'multi-el-dual'],
              [el.length > 2, 'multi-el'],
            )}
            style={
              pList.length > 2
                ? {
                    width: `calc(100% / ${option.maxC} - 2px)`,
                    height: `calc(100% / ${option.maxR} - 2px)`,
                  }
                : undefined
            }
          >
            <MediaPlayer src={steam} poster={poster} ref={ref} loop controls />
          </div>
        ))}
      </Grid>
      <div className="multi-close">
        <Tooltip className="h-fix" text={tText} position="left">
          <IOInformationCircleOutline size={16} />
        </Tooltip>
        <IconButton
          onClick={() => {
            try {
              const doc = document as any;
              dispatch(setModal(null));
              if (doc.exitFullscreen) {
                doc.exitFullscreen();
              } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
              } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
              } else if (doc.webkitCancelFullScreen) {
                doc.webkitCancelFullScreen();
              }
            } catch (e) {
              console.warn(e);
            }
          }}
        >
          <IOClose />
        </IconButton>
      </div>
    </>
  );
}
