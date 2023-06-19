import React, { createRef, useCallback, useMemo, useState } from 'react';
import {
  Grid,
  IconButton,
  IOChevronBack,
  IOChevronForward,
  IOClose,
  useKeyListener,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store';
import { selectLabel, selectMovie, selectSearch } from '@/store/MovieStore';
import usePreload from '@/store/preload';
import MovieComp, { MovieComRefType } from '@/component/MovieComp';
import { useGlobalContext } from '@/context/GlobalContext';

export default function EditModal(props: { close: () => void }) {
  const { close } = props;
  const search = useAppSelector(selectSearch);
  const context = useGlobalContext();
  const { loadMovie } = usePreload();
  const ref = createRef<MovieComRefType>();
  const label = useAppSelector(selectLabel);
  const data = useAppSelector(selectMovie);
  const [pos, setPos] = useState<number>(0);
  const [numPos, setNumPos] = useState<number>(0);

  const cur = useMemo(() => data?.[pos], [data, pos]);
  const setStar = useCallback(
    (num: number) => {
      if (cur) {
        context.updateMovie(cur.e_id, { rating: num }).then((res) => {
          if (!res.success || !res.data) {
            toast.error(`Fehler`);
          } else {
            ref.current?.updateLib(res.data);
          }
        });
      }
    },
    [cur]
  );
  useKeyListener([
    {
      key: {
        primary: 'alt',
        secondary: 'ArrowLeft',
      },
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
      action: () => {
        loadMovie(search || undefined);
        close();
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'ArrowDown',
      },
      action: () => {
        if (cur) {
          ref.current?.toggleStar();
        }
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'ArrowUp',
      },
      action: () => {
        if (cur) {
          ref.current?.togglePlay();
        }
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'ArrowRight',
      },
      action: () => {
        if (cur) {
          ref.current?.seekForward();
        }
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'ArrowLeft',
      },
      action: () => {
        if (cur) {
          ref.current?.seekBack();
        }
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'Numpad0',
      },
      action: () => {
        setStar(-1);
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'Numpad1',
      },
      action: () => {
        setStar(1);
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'Numpad2',
      },
      action: () => {
        setStar(2);
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'Numpad3',
      },
      action: () => {
        setStar(3);
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'Numpad4',
      },
      action: () => {
        setStar(4);
      },
    },
    {
      key: {
        primary: 'ctrl',
        secondary: 'Numpad5',
      },
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
  ]);
  if (!label || !data || !cur) {
    return null;
  }
  return (
    <Grid flex className="edit-modal" hCenter>
      <Grid className="edit-wrapper" flex hCenter flexC>
        <Grid flex flexR className="edit-close" gap={8} vCenter>
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
              close();
            }}
          >
            <IOClose />
          </IconButton>
        </Grid>

        <Grid className="glx-h-full" flexR vCenter fullWidth gap={12}>
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
          <Grid flex className="edit-main">
            <MovieComp
              ref={ref}
              key={`edit_${cur.e_id}`}
              mov={cur}
              label={label}
              reload={() => {
                loadMovie(search || undefined);
              }}
              editMode
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
