import React, { useMemo, useState } from 'react';
import { Button, Grid, LPulse, Table } from '@grandlinex/react-components';
import { MovieLib } from '@elschnagoo/xserver-con';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectMovie,
  selectMulti,
  selectSearch,
  setModal,
} from '@/store/MovieStore';
import usePreload from '@/store/preload';
import BaseModal from '@/component/BaseModal';
import StarComp from '@/component/StarComp';

export default function BulkRatingModal() {
  const dispatch = useAppDispatch();
  const multi = useAppSelector(selectMulti);
  const search = useAppSelector(selectSearch);
  const [loading, setLoading] = useState(false);
  const { loadMovie } = usePreload();
  const [rating, setRating] = useState(-1);
  const mov = useAppSelector(selectMovie);
  const context = useGlobalContext();

  const data = useMemo<MovieLib[]>(() => {
    const movList: MovieLib[] = [];
    if (!mov) return movList;
    multi.forEach((l) => {
      const el = mov.find((e) => e.e_id === l);
      if (el) {
        movList.push(el);
      }
    });
    return movList;
  }, [multi, mov]);
  if (!mov) {
    return (
      <Grid flex flexR hCenter>
        <LPulse />
      </Grid>
    );
  }
  return (
    <BaseModal title="Bulk Labeling" disableClose={loading}>
      {loading ? (
        <Grid flex flexR hCenter>
          <LPulse />
        </Grid>
      ) : (
        <>
          <StarComp onChange={(e) => setRating(e)} />
          <Grid flex flexRow flexEnd>
            <Button
              onClick={async () => {
                setLoading(true);
                for (const cur of data) {
                  const l = await context.updateMovie(cur.e_id, {
                    rating,
                  });
                  if (!l.success) {
                    toast.warn(
                      `Action completed with warnings for:\n${cur.movie_name}`,
                    );
                  }
                }
                toast.success('Action completed');
                loadMovie(search, true);
                dispatch(setModal(null));
              }}
            >
              Update Rating
            </Button>
          </Grid>
        </>
      )}
      <Table
        rowData={data}
        columnDefs={[
          {
            field: 'e_id',
            headerName: 'ID',
          },
          {
            field: 'movie_name',
            headerName: 'Name',
          },
        ]}
      />
    </BaseModal>
  );
}
