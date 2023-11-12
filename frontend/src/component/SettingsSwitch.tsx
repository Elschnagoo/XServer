import React from 'react';
import LabelModal from '@/component/LabelModal';
import WatchModal from '@/component/WatchModal';
import LibModal from '@/component/LibModal';
import DownloadModal from '@/component/DownloadModal';
import RatingModal from '@/component/RatingModal';

export enum SETTINGS {
  PLAY = 'PLAY',
  LABEL = 'LABEL',
  RATING = 'RATING',
  LIB = 'LIB',
  DOWNLOAD = 'DOWNLOAD',
}

export default function SettingsSwitch({
  mode,
  divRef,
}: {
  mode: SETTINGS;
  divRef?: React.RefObject<HTMLDivElement>;
}) {
  switch (mode) {
    case SETTINGS.PLAY:
      return <WatchModal />;
    case SETTINGS.LABEL:
      return <LabelModal divRef={divRef} />;
    case SETTINGS.RATING:
      return <RatingModal divRef={divRef} />;
    case SETTINGS.DOWNLOAD:
      return <DownloadModal />;
    case SETTINGS.LIB:
      return <LibModal />;
    default:
      return null;
  }
}
SettingsSwitch.defaultProps = {
  divRef: undefined,
};
