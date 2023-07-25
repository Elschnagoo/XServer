import React from 'react';
import {
  Form,
  Grid,
  IconButton,
  InputOptionType,
  IOClose,
} from '@grandlinex/react-components';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectLabel,
  selectSearch,
  setMax,
  setSearch,
} from '@/store/MovieStore';
import usePreload from '@/store/preload';

export enum SearchOrder {
  DATE_ASC = 'date_asc',
  DATE_DSC = 'date_dsc',
  RATING_ASC = 'rating_asc',
  RATING_DSC = 'rating_dsc',
  DURATION_ASC = 'duration_asc',
  DURATION_DSC = 'duration_dsc',
  NAME_ASC = 'name_asc',
  NAME_DSC = 'name_dsc',
  SHUFFLE = 'shuffle',
}
export enum Sync {
  ALL = 'all',
  PENDING = 'pending',
  DONE = 'done',
}
const defaultSearch = {
  titel: '',
  rating: '',
  label: [],
  order: SearchOrder.DATE_DSC,
  sync: Sync.ALL,
};
export default function SearchModal(props: { close: () => void }) {
  const { close } = props;
  const { loadMovie } = usePreload();
  const search = useAppSelector(selectSearch);
  const dispatch = useAppDispatch();
  const label = useAppSelector(selectLabel);
  if (!label) {
    return null;
  }
  return (
    <Grid flex className="s-modal" center>
      <Grid className="form-wrapper" flex flexC gap={4}>
        <Grid flex flexR gap={4} flexSpaceB>
          <h1>Suche</h1>
          <IconButton onClick={close}>
            <IOClose />
          </IconButton>
        </Grid>
        <Form
          className="glx-w-full-4"
          defaultState={search || defaultSearch}
          submit={{
            buttonText: 'Suchen',
            onSubmit: async ({ form, setError, clear }) => {
              dispatch(setMax(14));
              dispatch(setSearch(form));
              loadMovie(form);
              close();
            },
          }}
          options={[
            [
              {
                key: 'titel',
                type: InputOptionType.TEXT,
                label: 'Titel',
                autoFocus: true,
              },
            ],
            [
              {
                key: 'rating',
                type: InputOptionType.NUMBER,
                label: 'Rating',
                restriction: {
                  min: 0,
                  max: 5,
                },
              },
            ],
            [
              {
                key: 'label',
                type: InputOptionType.TAG_SELECTOR,
                label: 'Label',
                items: label.map((l) => ({
                  key: l.e_id,
                  name: l.label_name,
                  icon: l.icon as any,
                  other: l.color,
                })),
              },
            ],
            [
              {
                key: 'syc',
                type: InputOptionType.DROPDOWN,
                label: 'State',
                items: [
                  {
                    key: Sync.ALL,
                    name: 'All (default)',
                  },
                  {
                    key: Sync.DONE,
                    name: 'Synced',
                  },
                  {
                    key: Sync.PENDING,
                    name: 'Sync Pending',
                  },
                ],
              },
            ],
            [
              {
                key: 'order',
                type: InputOptionType.DROPDOWN,
                label: 'Order',
                items: [
                  {
                    key: SearchOrder.DATE_DSC,
                    name: 'Date (Descending ,default)',
                  },
                  {
                    key: SearchOrder.DATE_ASC,
                    name: 'Date (Ascending)',
                  },
                  {
                    key: SearchOrder.RATING_DSC,
                    name: 'Rating (Descending)',
                  },
                  {
                    key: SearchOrder.RATING_ASC,
                    name: 'Rating (Ascending)',
                  },
                  {
                    key: SearchOrder.DURATION_DSC,
                    name: 'Duration (Descending)',
                  },
                  {
                    key: SearchOrder.DURATION_ASC,
                    name: 'Duration (Ascending)',
                  },
                  {
                    key: SearchOrder.NAME_ASC,
                    name: 'Name (A-Z)',
                  },
                  {
                    key: SearchOrder.NAME_DSC,
                    name: 'Name (Z-A)',
                  },
                  {
                    key: SearchOrder.SHUFFLE,
                    name: 'Random',
                  },
                ],
              },
            ],
          ]}
        />
      </Grid>
    </Grid>
  );
}
