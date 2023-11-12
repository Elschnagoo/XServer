import React from 'react';
import { useAppSelector } from '@/store';
import { selectModal } from '@/store/MovieStore';
import { MODAL } from '@/lib';
import SearchModal from '@/component/SearchModal';
import MultiView from '@/component/MultiView';
import BulkLabelModal from '@/component/BulkLabelModal';
import BulkRatingModal from '@/component/BulkRatingModal';
import BulkDeleteModal from '@/component/BulkDeleteModal';
import Settings from '@/page/Settings';

export default function ModalSwitch() {
  const modal = useAppSelector(selectModal);
  switch (modal) {
    case MODAL.MULTI_VIEW:
      return <MultiView />;
    case MODAL.SEARCH:
      return <SearchModal />;
    case MODAL.BULK_LABEL:
      return <BulkLabelModal />;
    case MODAL.BULK_DELETE:
      return <BulkDeleteModal />;
    case MODAL.BULK_RATING:
      return <BulkRatingModal />;
    case MODAL.SETTINGS:
      return <Settings />;
    default:
      return null;
  }
}
