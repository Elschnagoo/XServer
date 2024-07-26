import React, { useMemo } from 'react';
import { Form, InputOptionType } from '@grandlinex/react-components';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectForcePreview,
  selectForceSuggest,
  selectMode,
  selectVideoQuery,
  setForcePreview,
  setForceSuggest,
  setModal,
  setMode,
  setVideoQuery,
} from '@/store/MovieStore';
import { PlayMode } from '@/lib';
import PersistentStorage from '@/utils/PersistentStorage';
import { useGlobalContext } from '@/context/GlobalContext';

export default function DefaultModal() {
  const context = useGlobalContext();
  const mode = useAppSelector(selectMode);
  const forcePreview = useAppSelector(selectForcePreview);
  const forceSuggestions = useAppSelector(selectForceSuggest);
  const videoQuery = useAppSelector(selectVideoQuery);

  const dispatch = useAppDispatch();

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
        query: videoQuery,
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
          PersistentStorage.save('mode', form.mode);

          const ax = await context.saveGlobalConfig({
            key: 'default-query',
            value: form.query,
          });
          if (ax.success) {
            dispatch(setVideoQuery(form.query));
          }
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
      ]}
    />
  );
}
