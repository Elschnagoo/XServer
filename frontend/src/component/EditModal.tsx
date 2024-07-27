import React, { createRef, useMemo, useRef, useState } from 'react';
import {
  DropDownIconMenu,
  Grid,
  IconButton,
  IOClose,
  IOInformationCircle,
  IOSettings,
  KeyBind,
  Tooltip,
  useKeyListener,
  uuid,
} from '@grandlinex/react-components';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectEditMode,
  selectMovie,
  selectSearch,
  setEditMode,
  setModal,
} from '@/store/MovieStore';
import usePreload from '@/store/preload';
import MovieComp, { MovieComRefType } from '@/component/MovieComp';
import { MODAL } from '@/lib';

export default function EditModalV2() {
  const dispatch = useAppDispatch();

  const parentPos = useAppSelector(selectEditMode);
  const search = useAppSelector(selectSearch);
  const { clearLoadMovie, loadMoviePage } = usePreload();
  const ref = useRef(createRef<MovieComRefType>());
  const data = useAppSelector(selectMovie);
  const [forcePlay, setForcePlay] = useState<boolean>(false);
  const [forceSuggest, setForceSuggest] = useState<boolean>(false);
  const [doubleTime, setDoubleTime] = useState<boolean>(false);
  const [pos, setPos] = useState<number>(parentPos ?? 0);
  const [numPos, setNumPos] = useState<number>(parentPos ?? 0);
  const [findMatch, setFindMatch] = useState<boolean>(false);
  const trace = useMemo(() => uuid(), []);

  const cur = useMemo(() => data?.[pos], [data, pos]);

  const keyListerner = useMemo<(KeyBind & { description?: string })[]>(
    () => [
      {
        key: {
          primary: 'alt',
          secondary: 'ArrowLeft',
        },
        description: 'Previous element',
        action: () => {
          if (pos > 0) {
            setPos(pos - 1);
            setNumPos(pos - 1);
          }
        },
      },
      {
        key: {
          primary: 'alt',
          secondary: 'ArrowRight',
        },
        description: 'Next element',
        action: () => {
          if (data && pos < data.length - 1) {
            setPos(pos + 1);
            setNumPos(pos + 1);
            if (pos === data.length - 1) {
              loadMoviePage();
            }
          }
        },
      },
      {
        key: {
          primary: 'alt',
          secondary: 'KeyW',
        },
        description: 'Close editor',
        action: () => {
          clearLoadMovie();
          dispatch(setEditMode(-1));
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'ArrowDown',
        },
        description: 'Toggle star',
        action: () => {
          if (cur) {
            ref.current.current?.toggleStar();
          }
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'ArrowUp',
        },
        description: 'Toggle Label',
        action: () => {
          if (cur) {
            ref.current.current?.toggleLabel();
          }
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Space',
        },
        description: 'Toggle Play',
        action: () => {
          if (cur) {
            ref.current.current?.togglePlay();
          }
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'ArrowRight',
        },
        description: 'Seek forward',
        action: () => {
          if (cur) {
            ref.current.current?.seekForward();
          }
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'ArrowLeft',
        },
        description: 'Seek back',
        action: () => {
          if (cur) {
            ref.current.current?.seekBack();
          }
        },
      },
    ],
    [cur, data, dispatch, clearLoadMovie, pos, search],
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
  if (!data || !cur) {
    return null;
  }
  return (
    <Grid flex className="edit-modal" hCenter>
      <MovieComp
        ref={ref.current}
        key={`edit_${cur.e_id}`}
        mov={cur}
        trace={trace}
        forcePlay={forcePlay}
        doubleTime={doubleTime}
        suggest={forceSuggest}
        editMode
        reload={() => {
          clearLoadMovie();
        }}
        autoFindMatch={findMatch}
      />

      {createPortal(
        <Grid flex flexR flexSpaceB className="overlay-header">
          <Grid>
            <b>{cur.movie_name}</b>
          </Grid>

          <Grid flex flexR className="edit-close" gap={8} hCenter vCenter>
            <Grid>
              <IconButton
                disabled={pos === 0}
                onClick={() => {
                  setPos(pos - 1);
                  setNumPos(pos - 1);
                }}
                icon="IOChevronBack"
              />
              <IconButton
                disabled={pos === data.length - 1}
                onClick={() => {
                  setPos(pos + 1);
                  setNumPos(pos + 1);
                  if (pos === data.length - 2) {
                    loadMoviePage();
                  }
                }}
                icon="IOChevronForward"
              />
            </Grid>
            <Tooltip className="h-fix" text={tText} position="bottom">
              <IOInformationCircle size={24} />
            </Tooltip>
            <IconButton
              toolTip={{
                text: 'Settings',
                position: 'left',
              }}
              onClick={() => dispatch(setModal(MODAL.SETTINGS))}
            >
              <IOSettings />
            </IconButton>
            <DropDownIconMenu
              left
              menu={[
                {
                  key: 'forcePlay',
                  label: 'Autoplay video',
                  checkBox: true,
                  value: forcePlay,
                },
                {
                  key: 'forceSuggest',
                  label: 'Auto Suggest Labels',
                  checkBox: true,
                  value: forceSuggest,
                },
                {
                  key: 'findMatch',
                  label: 'Media Suggestions',
                  checkBox: true,
                  value: findMatch,
                },
                {
                  key: 'doubleTime',
                  label: 'Speed 2x',
                  checkBox: true,
                  value: doubleTime,
                },
              ]}
              onChange={(key, value) => {
                if (key === 'forcePlay') {
                  setForcePlay(!!value);
                } else if (key === 'forceSuggest') {
                  setForceSuggest(!!value);
                } else if (key === 'findMatch') {
                  setFindMatch(!!value);
                } else if (key === 'doubleTime') {
                  setDoubleTime(!!value);
                }
              }}
            />
            ({pos + 1}/{data.length})
            <input
              min={1}
              max={data.length}
              type="number"
              value={numPos + 1}
              pattern="[0-9]*"
              className="chang-inp"
              onBlur={() => {
                if (pos !== numPos) {
                  setPos(numPos);
                  if (numPos + 1 === data?.length) {
                    loadMoviePage();
                  }
                }
              }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  if (pos !== numPos) {
                    setPos(numPos);
                    if (numPos + 1 === data?.length) {
                      loadMoviePage();
                    }
                  }
                }
              }}
              onChange={(e) => {
                const int = parseInt(e.target.value, 10);
                if (int > 0 && int <= data.length) {
                  setNumPos(int - 1);
                } else {
                  console.log('Not a number');
                }
              }}
            />
            <IconButton
              onClick={() => {
                clearLoadMovie();
                dispatch(setEditMode(-1));
              }}
            >
              <IOClose />
            </IconButton>
          </Grid>
        </Grid>,
        document.getElementById('mount')!,
      )}
    </Grid>
  );
}
