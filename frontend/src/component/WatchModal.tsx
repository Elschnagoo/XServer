import React, { useMemo } from 'react';
import { Form, InputOptionType } from '@grandlinex/react-components';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectForcePreview,
  selectForceSuggest,
  selectMode,
  setForcePreview,
  setForceSuggest,
  setModal,
  setMode,
} from '@/store/MovieStore';
import { PlayMode } from '@/lib';
import PersistentStorage from '@/utils/PersistentStorage';

export default function WatchModal() {
  const mode = useAppSelector(selectMode);
  const forcePreview = useAppSelector(selectForcePreview);
  const forceSuggestions = useAppSelector(selectForceSuggest);

  const dispatch = useAppDispatch();
  const option = PersistentStorage.getMultiOptions();
  const query = PersistentStorage.getDefaultQuery();

  const opts = useMemo(
    () => Object.values(PlayMode).map((v) => ({ key: v, name: v })),
    [],
  );
  return (
    <Form
      className="glx-w-full-4"
      defaultState={{
        mode,
        preview: forcePreview,
        suggest: forceSuggestions,
        maxR: option.maxR,
        maxC: option.maxC,
        query,
      }}
      submit={{
        buttonText: 'Save',
        onSubmit: async ({ form }) => {
          dispatch(setModal(null));
          dispatch(setMode(form.mode));
          dispatch(setForcePreview(form.preview));
          PersistentStorage.flagSave('forcePreview', form.preview);
          dispatch(setForceSuggest(form.suggest));
          PersistentStorage.flagSave('suggestion', form.suggest);
          PersistentStorage.setDefaultQuery(form.query);
          PersistentStorage.setMultiOptions({
            maxR: form.maxR,
            maxC: form.maxC,
          });
        },
      }}
      options={[
        [
          {
            key: 'mode',
            type: InputOptionType.DROPDOWN,
            label: 'Mode',
            items: opts,
          },
        ],
        [
          {
            key: 'preview',
            type: InputOptionType.CHECKBOX,
            label: 'Force play preview',
          },
        ],
        [
          {
            key: 'suggest',
            type: InputOptionType.CHECKBOX,
            label: 'Force label suggestion',
          },
        ],
        [
          {
            key: 'query',
            type: InputOptionType.TEXT,
            label: 'Set default query for label video match',
          },
        ],
        [
          {
            key: 'maxR',
            type: InputOptionType.NUMBER,
            label: 'Set max rows shown in multi view',
            restriction: {
              min: 1,
            },
          },
        ],
        [
          {
            key: 'maxC',
            type: InputOptionType.NUMBER,
            label: 'Set max columns shown in multi view',
            restriction: {
              min: 1,
            },
          },
        ],
      ]}
    />
  );
}
