import React from 'react';
import { Form, InputOptionType } from '@grandlinex/react-components';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectLabel,
  selectSearch,
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
  PLAYS_NO = 'plays_no',
  QUALITY_ASC = 'quality_asc',
  QUALITY_DSC = 'quality_dsc',
  SHUFFLE = 'shuffle',
}
export enum Sync {
  ALL = 'all',
  PENDING = 'pending',
  DONE = 'done',
}
export enum Duration {
  ALL = 'all',
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}
const defaultSearch = {
  titel: '',
  ratingMin: '',
  ratingMax: '',
  needLabel: [],
  optLabel: [],
  notLabel: [],
  sortOrder: SearchOrder.DATE_DSC,
  sync: Sync.ALL,
  link: 'default',
  duration: Duration.ALL,
};
export default function SearchModal() {
  const { clearLoadMovie } = usePreload();
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
            dispatch(setSearch(form));
            clearLoadMovie();
            dispatch(setModal(null));
          },
        }}
        options={[
          [
            {
              key: 'title',
              type: InputOptionType.TEXT,
              label: 'Titel',
              autoFocus: true,
            },
          ],
          [
            {
              key: 'ratingMin',
              type: InputOptionType.NUMBER,
              label: 'Rating Min',
              restriction: {
                min: 0,
                max: 5,
              },
            },
            {
              key: 'ratingMax',
              type: InputOptionType.NUMBER,
              label: 'Rating Max',
              restriction: {
                min: 0,
                max: 5,
              },
            },
            {
              key: 'link',
              type: InputOptionType.DROPDOWN,
              label: 'Has Link',
              items: [
                {
                  key: 'default',
                  name: 'Default',
                },
                {
                  key: 'has',
                  name: 'Has Link',
                },
                {
                  key: 'hasnot',
                  name: 'Has no Link',
                },
              ],
            },
          ],
          [
            {
              key: 'needLabel',
              type: InputOptionType.TAG_SELECTOR,
              label: 'Have all Label',
              items: label.map((l) => ({
                key: l.e_id,
                name: l.label_name,
                icon: l.icon as any,
                meta: l.color,
              })),
            },
          ],
          [
            {
              key: 'optLabel',
              type: InputOptionType.TAG_SELECTOR,
              label: 'Have at least one Label',
              items: label.map((l) => ({
                key: l.e_id,
                name: l.label_name,
                icon: l.icon as any,
                meta: l.color,
              })),
            },
          ],
          [
            {
              key: 'notLabel',
              type: InputOptionType.TAG_SELECTOR,
              label: 'Exclude all Label',
              items: label.map((l) => ({
                key: l.e_id,
                name: l.label_name,
                icon: l.icon as any,
                meta: l.color,
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
            {
              key: 'duration',
              type: InputOptionType.DROPDOWN,
              label: 'Duration',
              items: [
                {
                  key: Duration.ALL,
                  name: 'All (default)',
                },
                {
                  key: Duration.SHORT,
                  name: 'Short (0-10 min)',
                },
                {
                  key: Duration.MEDIUM,
                  name: 'Medium (10-30 min)',
                },
                {
                  key: Duration.LONG,
                  name: 'Long (30+ min)',
                },
              ],
            },
          ],
          [
            {
              key: 'sortOrder',
              type: InputOptionType.DROPDOWN,
              label: 'Sort/Order',
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
                  key: SearchOrder.QUALITY_DSC,
                  name: 'Quality (Descending)',
                },
                {
                  key: SearchOrder.QUALITY_ASC,
                  name: 'Quality (Ascending)',
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
                  key: SearchOrder.PLAYS_NO,
                  name: 'Unplayed',
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
