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
import LocalStorage from '@/utils/LocalStorage';

export default function WatchModal() {
  const mode = useAppSelector(selectMode);
  const forcePreview = useAppSelector(selectForcePreview);
  const forceSuggestions = useAppSelector(selectForceSuggest);

  const dispatch = useAppDispatch();
  const option = LocalStorage.jsonLoad<{ max: number }>('multiView', {
    max: 4,
  })!;
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
        max: option.max,
      }}
      submit={{
        buttonText: 'Save',
        onSubmit: async ({ form }) => {
          dispatch(setModal(null));
          dispatch(setMode(form.mode));
          dispatch(setForcePreview(form.preview));
          LocalStorage.flagSave('forcePreview', form.preview);
          dispatch(setForceSuggest(form.suggest));
          LocalStorage.flagSave('suggestion', form.suggest);
          LocalStorage.jsonSave('multiView', {
            max: form.max,
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
            key: 'max',
            type: InputOptionType.NUMBER,
            label: 'Maximum videos shown in multi view',
            restriction: {
              min: 1,
            },
          },
        ],
      ]}
    />
  );
}
