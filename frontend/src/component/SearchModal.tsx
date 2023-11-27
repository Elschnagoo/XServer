import React from 'react';
import { Form, InputOptionType } from '@grandlinex/react-components';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectLabel,
  selectSearch,
  setMax,
  setModal,
  setSearch,
} from '@/store/MovieStore';
import usePreload from '@/store/preload';
import BaseModal from '@/component/BaseModal';

export enum SearchOrder {
  DATE_ASC = 'date_asc',
  DATE_DSC = 'date_dsc',
  RATING_ASC = 'rating_asc',
  RATING_DSC = 'rating_dsc',
  DURATION_ASC = 'duration_asc',
  DURATION_DSC = 'duration_dsc',
  NAME_ASC = 'name_asc',
  NAME_DSC = 'name_dsc',
  LAST_PLAYED_ASC = 'last_played_asc',
  LAST_PLAYED_DSC = 'last_played_dsc',
  PLAYS_ASC = 'plays_asc',
  PLAYS_DSC = 'plays_dsc',
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
  exclude: [],
  order: SearchOrder.DATE_DSC,
  sync: Sync.ALL,
};
export default function SearchModal() {
  const { loadMovie } = usePreload();
  const search = useAppSelector(selectSearch);
  const dispatch = useAppDispatch();
  const label = useAppSelector(selectLabel);
  if (!label) {
    return null;
  }
  return (
    <BaseModal title="Search">
      <Form
        className="glx-w-full-4"
        defaultState={search || defaultSearch}
        submit={{
          buttonText: 'Search',
          onSubmit: async ({ form }) => {
            dispatch(setMax(14));
            dispatch(setSearch(form));
            loadMovie(form);
            dispatch(setModal(null));
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
              key: 'min',
              type: InputOptionType.NUMBER,
              label: 'Rating Min',
              restriction: {
                min: 0,
                max: 5,
              },
            },
            {
              key: 'max',
              type: InputOptionType.NUMBER,
              label: 'Rating Max',
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
              label: 'Have Label',
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
              key: 'exclude',
              type: InputOptionType.TAG_SELECTOR,
              label: 'Exclude Label',
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
                  name: 'Date (Descending, default)',
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
                  key: SearchOrder.PLAYS_ASC,
                  name: 'Plays (Ascending)',
                },
                {
                  key: SearchOrder.PLAYS_DSC,
                  name: 'Plays (Descending)',
                },
                {
                  key: SearchOrder.LAST_PLAYED_ASC,
                  name: 'Last Played (Ascending)',
                },
                {
                  key: SearchOrder.LAST_PLAYED_DSC,
                  name: 'Last Played (Descending)',
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
    </BaseModal>
  );
}
