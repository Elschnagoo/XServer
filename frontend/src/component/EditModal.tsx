import React, {
  createRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  CheckBox,
  DropDownIconMenu,
  Grid,
  IconButton,
  IOChevronBack,
  IOChevronForward,
  IOClose,
  IOInformationCircle,
  IOSettings,
  KeyBind,
  Tooltip,
  useKeyListener,
  useUIContext,
  uuid,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
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
import { useGlobalContext } from '@/context/GlobalContext';
import { MODAL } from '@/lib';

export default function EditModal() {
  const dispatch = useAppDispatch();
  const ui = useUIContext();

  const parentPos = useAppSelector(selectEditMode);
  const search = useAppSelector(selectSearch);
  const context = useGlobalContext();
  const { loadMovie } = usePreload();
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
  const setStar = useCallback(
    (num: number) => {
      if (cur) {
        context.updateMovie(cur.e_id, { rating: num }).then((res) => {
          if (!res.success || !res.data) {
            toast.error(`Fehler`);
          } else {
            ref.current.current?.updateLib(res.data);
          }
        });
      }
    },
    [context, cur, ref],
  );
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
          loadMovie(search || undefined);
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
        description: 'Toggle Player',
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
      {
        key: {
          primary: 'ctrl',
          secondary: 'Numpad0',
        },
        description: 'Reset Stars',
        action: () => {
          setStar(-1);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Numpad1',
        },
        description: 'Set star to 1',
        action: () => {
          setStar(1);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Numpad2',
        },
        description: 'Set star to 2',
        action: () => {
          setStar(2);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Numpad3',
        },
        description: 'Set star to 3',
        action: () => {
          setStar(3);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Numpad4',
        },
        description: 'Set star to 4',
        action: () => {
          setStar(4);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Numpad5',
        },
        description: 'Set star to 5',
        action: () => {
          setStar(5);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Digit0',
        },
        action: () => {
          setStar(-1);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Digit1',
        },
        action: () => {
          setStar(1);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Digit2',
        },
        action: () => {
          setStar(2);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Digit3',
        },
        action: () => {
          setStar(3);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Digit4',
        },
        action: () => {
          setStar(4);
        },
      },
      {
        key: {
          primary: 'ctrl',
          secondary: 'Digit5',
        },
        action: () => {
          setStar(5);
        },
      },
    ],
    [cur, data, dispatch, loadMovie, pos, search, setStar],
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
      <Grid className="edit-wrapper" flex hCenter flexC>
        <Grid flex flexR className="edit-close" gap={8} hCenter vCenter>
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
              }
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                if (pos !== numPos) {
                  setPos(numPos);
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
              loadMovie(search || undefined);
              dispatch(setEditMode(-1));
            }}
          >
            <IOClose />
          </IconButton>
        </Grid>

        <Grid className="glx-h-full" fullWidth flexR vCenter gap={12}>
          <Grid flex hCenter>
            <IconButton
              disabled={pos === 0}
              onClick={() => {
                setPos(pos - 1);
                setNumPos(pos - 1);
              }}
            >
              <IOChevronBack size={24} />
            </IconButton>
          </Grid>
          <Grid
            flex
            className={['edit-main', [!ui.tooltipDisabled, 'edit-desktop']]}
          >
            <MovieComp
              ref={ref.current}
              key={`edit_${cur.e_id}`}
              mov={cur}
              trace={trace}
              forcePlay={forcePlay}
              doubleTime={doubleTime}
              suggest={forceSuggest}
              showProgress
              reload={() => {
                loadMovie(search || undefined);
              }}
              editMode
              autoFindMatch={findMatch}
            />
          </Grid>
          <Grid flex vCenter>
            <IconButton
              disabled={pos === data.length - 1}
              onClick={() => {
                setPos(pos + 1);
                setNumPos(pos + 1);
              }}
            >
              <IOChevronForward size={24} />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
EditModal.defaultProps = {
  parentPos: undefined,
};
