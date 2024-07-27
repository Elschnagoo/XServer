import { cnx, Grid, LDots, LPulse } from '@grandlinex/react-components';
import React, { useMemo } from 'react';
import { MovieLib } from '@elschnagoo/xserver-con';
import {
  addMulti,
  removeMulti,
  selectEditMode,
  selectForceSuggest,
  selectLabel,
  selectLoading,
  selectMax,
  selectModal,
  selectMovie,
  selectMulti,
  selectRevision,
} from '@/store/MovieStore';
import { MODAL } from '@/lib';
import MovieComp from '@/component/MovieComp';
import { useAppDispatch, useAppSelector } from '@/store';
import usePreload from '@/store/preload';

export default function HomeGrid({ double }: { double: boolean }) {
  const dispatch = useAppDispatch();

  const label = useAppSelector(selectLabel);
  const forceSuggestions = useAppSelector(selectForceSuggest);
  const revision = useAppSelector(selectRevision);
  const modal = useAppSelector(selectModal);
  const editMode = useAppSelector(selectEditMode);
  const data = useAppSelector(selectMovie);
  const multi = useAppSelector(selectMulti);
  const loading = useAppSelector(selectLoading);
  const max = useAppSelector(selectMax);
  const { loadMoviePage, clearLoadMovie } = usePreload();

  const cur = useMemo<MovieLib[]>(() => {
    if (!data) {
      return [];
    }
    return data;
  }, [data]);

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
              data.length < max
            ) {
              loadMoviePage();
            }
          }}
        >
          {modal !== MODAL.MULTI_VIEW
            ? cur.map((e, index) => (
                <MovieComp
                  key={`${e.e_id}_${revision}`}
                  mov={e}
                  reload={() => {
                    clearLoadMovie();
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
          {loading && (
            <Grid className="item" flex flexC hCenter vCenter fullWidth>
              <div style={{ width: '62px', padding: '10px' }}>
                <LDots />
              </div>
            </Grid>
          )}
        </Grid>
      )}
    </Grid>
  );
}
