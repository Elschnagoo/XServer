import React, { useMemo } from 'react';
import {
  Form,
  Grid,
  InputOptionType,
  LPulse,
  Table,
} from '@grandlinex/react-components';
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

export default function BulkLabelModal() {
  const dispatch = useAppDispatch();
  const multi = useAppSelector(selectMulti);
  const { clearLoadMovie } = usePreload();

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
    <BaseModal title="Bulk Labeling">
      <Form
        className="glx-w-full-4"
        submit={{
          buttonText: 'Update Label',
          loading: true,
          onSubmit: async ({ form, setError }) => {
            if (form.label.length === 0) {
              setError({
                field: [
                  {
                    key: 'label',
                    message: 'Label list cannot be empty',
                  },
                ],
              });
              return;
            }
            let warn = false;

            for (const cur of data) {
              for (const curLabel of form.label) {
                const l = await context.bindLabel({
                  label: curLabel,
                  mov_lib: cur.e_id,
                });
                if (!l.success) {
                  warn = true;
                }
              }
            }
            if (warn) {
              toast.warn(`Action completed with warnings`);
            } else {
              toast.success('Action completed');
            }

            clearLoadMovie(true);
            dispatch(setModal(null));
          },
        }}
        options={[
          [
            {
              key: 'label',
              type: InputOptionType.TAG_SELECTOR,
              label: 'Add Label',
              items: label.map((l) => ({
                key: l.e_id,
                name: l.label_name,
                icon: l.icon as any,
                meta: l.color,
              })),
            },
          ],
        ]}
      />
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
