import React, { createRef, useRef, useState } from 'react';
import { ContentSwitcher } from '@grandlinex/react-components';
import BaseModal from '@/component/BaseModal';
import SettingsSwitch, { SETTINGS } from '@/component/SettingsSwitch';

export default function Settings() {
  const ref = useRef(createRef<HTMLDivElement>());
  const [mode, setMode] = useState(SETTINGS.PLAY);

  return (
    <BaseModal divRef={ref.current} title="Settings">
      <ContentSwitcher
        onChange={(c) => setMode(c.key as SETTINGS)}
        items={[
          {
            key: SETTINGS.PLAY,
            name: 'General',
          },
          {
            key: SETTINGS.LABEL,
            name: 'Labels',
          },
          {
            key: SETTINGS.RATING,
            name: 'Ratings',
          },
          {
            key: SETTINGS.DOWNLOAD,
            name: 'Downloads',
          },
          {
            key: SETTINGS.LIB,
            name: 'Libraries',
          },
        ]}
      />
      <SettingsSwitch mode={mode} divRef={ref.current} />
    </BaseModal>
  );
}
