import React from 'react';
import { useAppSelector } from '@/store';
import { selectModal } from '@/store/MovieStore';
import { MODAL } from '@/lib';
import SearchModal from '@/component/SearchModal';
import LabelModal from '@/component/LabelModal';
import DownloadModal from '@/component/DownloadModal';
import MultiView from '@/component/MultiView';
import LibModal from '@/component/LibModal';
import BulkLabelModal from '@/component/BulkLabelModal';
import BulkRatingModal from '@/component/BulkRatingModal';

export default function ModalSwitch() {
  const modal = useAppSelector(selectModal);
  switch (modal) {
    case MODAL.MULTI_VIEW:
      return <MultiView />;
    case MODAL.SEARCH:
      return <SearchModal />;
    case MODAL.LABEL:
      return <LabelModal />;
    case MODAL.BULK_LABEL:
      return <BulkLabelModal />;
    case MODAL.BULK_RATING:
      return <BulkRatingModal />;
    case MODAL.DOWNLOAD:
      return <DownloadModal />;
    case MODAL.LIB:
      return <LibModal />;
    default:
      return null;
  }
}
