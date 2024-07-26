import React from 'react';
import LabelModal from '@/component/LabelModal';
import LibModal from '@/component/LibModal';
import DownloadModal from '@/component/DownloadModal';
import RatingModal from '@/component/RatingModal';
import DefaultModal from '@/component/DefaultModal';

export enum SETTINGS {
  DEFAULT = 'DEFAULT',
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
    case SETTINGS.DEFAULT:
      return <DefaultModal />;
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
