import { cnx, Grid, LDots } from '@grandlinex/react-components';
import React, { useEffect, useMemo } from 'react';
import { MovieLib } from '@elschnagoo/xserver-con';
import {
  addMulti,
  removeMulti,
  selectEditMode,
  selectForceSuggest,
  selectLabel,
  selectMax,
  selectModal,
  selectMovie,
  selectMulti,
  selectRevision,
  selectSearch,
  setMax,
} from '@/store/MovieStore';
import { MODAL } from '@/lib';
import MovieComp from '@/component/MovieComp';
import { useAppDispatch, useAppSelector } from '@/store';
import usePreload from '@/store/preload';

export default function HomeGrid({ double }: { double: boolean }) {
  const dispatch = useAppDispatch();

  const search = useAppSelector(selectSearch);
  const label = useAppSelector(selectLabel);
  const forceSuggestions = useAppSelector(selectForceSuggest);
  const revision = useAppSelector(selectRevision);
  const modal = useAppSelector(selectModal);
  const editMode = useAppSelector(selectEditMode);
  const data = useAppSelector(selectMovie);
  const multi = useAppSelector(selectMulti);
  const max = useAppSelector(selectMax);
  const { loadMovie } = usePreload();

  const cur = useMemo<MovieLib[]>(() => {
    if (!data) {
      return [];
    }
    return data.slice(0, max);
  }, [max, data]);

  useEffect(() => {
    // DATA LENGTH IS SMALLER THAN MAX
    if (data && max > data.length) {
      dispatch(setMax(data.length));
    }
    // MAX IS SMALLER THAN 14 AND MAX IS SMALLER THAN DATA LENGTH
    if (data && max < data.length && max < 14) {
      if (data.length >= 14) {
        dispatch(setMax(14));
      } else {
        dispatch(setMax(data.length));
      }
    }
  }, [search, data, max, dispatch]);

  return (
    <Grid
      flex
      flexC
      className={cnx('body', [double, 'body-large'])}
      gap={24}
      vCenter
    >
      {!data || !label || editMode >= 0 ? (
        <Grid className="item" flex flexC hCenter vCenter>
          <div style={{ width: '62px' }}>
            <LDots />
          </div>
        </Grid>
      ) : (
        <Grid
          className="scroll-container"
          flex
          gap={12}
          onScroll={(event: React.UIEvent<HTMLDivElement>) => {
            const { target } = event;
            const div = target as HTMLDivElement;

            if (
              div.offsetHeight + div.scrollTop >= div.scrollHeight - 350 &&
              data &&
              data.length > max
            ) {
              dispatch(setMax(max + 14));
            }
          }}
        >
          {modal !== MODAL.MULTI_VIEW
            ? cur.map((e, index) => (
                <MovieComp
                  key={`${e.e_id}_${revision}`}
                  mov={e}
                  reload={() => {
                    loadMovie(search);
                  }}
                  suggest={forceSuggestions}
                  index={index}
                  multi={{
                    list: multi,
                    updateMulti: (id) => {
                      if (multi.includes(id)) {
                        dispatch(removeMulti(id));
                      } else {
                        dispatch(addMulti(id));
                      }
                    },
                  }}
                />
              ))
            : null}
          {cur.length === 0 ? <Grid> No Elements</Grid> : null}
        </Grid>
      )}
    </Grid>
  );
}
