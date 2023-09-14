import React, { useMemo } from 'react';
import { Button, Grid, LPulse, Table } from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { MovieLib } from '@elschnagoo/xserver-con';
import { useGlobalContext } from '@/context/GlobalContext';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectLabel,
  selectMovie,
  selectMulti,
  selectSearch,
  setModal,
} from '@/store/MovieStore';
import usePreload from '@/store/preload';
import BaseModal from '@/component/BaseModal';

export default function BulkDeleteModal() {
  const dispatch = useAppDispatch();
  const multi = useAppSelector(selectMulti);
  const search = useAppSelector(selectSearch);
  const { loadMovie } = usePreload();

  const mov = useAppSelector(selectMovie);
  const context = useGlobalContext();

  const label = useAppSelector(selectLabel);
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
  if (!label || !mov) {
    return (
      <Grid flex flexR hCenter>
        <LPulse />
      </Grid>
    );
  }
  return (
    <BaseModal title="Bulk Deletion">
      <Grid flex flexRow flexEnd>
        <Button
          onClick={async () => {
            let warn = false;
            for (const cur of data) {
              const l = await context.deleteMovie(cur.e_id);
              if (!l.success) {
                warn = true;
              }
            }
            if (warn) {
              toast.warn(`Action completed with warnings`);
            } else {
              toast.success('Action completed');
            }

            loadMovie(search, true);
            dispatch(setModal(null));
          }}
        >
          Delete Videos
        </Button>
      </Grid>
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
