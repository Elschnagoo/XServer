import React, { useMemo } from 'react';
import { Form, InputOptionType } from '@grandlinex/react-components';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectForcePreview,
  selectMode,
  setForcePreview,
  setModal,
  setMode,
} from '@/store/MovieStore';
import BaseModal from '@/component/BaseModal';
import { PlayMode } from '@/lib';

export default function WatchModal() {
  const mode = useAppSelector(selectMode);
  const forcePreview = useAppSelector(selectForcePreview);
  const dispatch = useAppDispatch();
  const opts = useMemo(
    () => Object.values(PlayMode).map((v) => ({ key: v, name: v })),
    [],
  );
  return (
    <BaseModal title="Play Mode">
      <Form
        className="glx-w-full-4"
        defaultState={{
          mode,
          preview: forcePreview,
        }}
        submit={{
          buttonText: 'Set mode',
          onSubmit: async ({ form }) => {
            dispatch(setModal(null));
            dispatch(setMode(form.mode));
            dispatch(setForcePreview(form.preview));
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
        ]}
      />
    </BaseModal>
  );
}
