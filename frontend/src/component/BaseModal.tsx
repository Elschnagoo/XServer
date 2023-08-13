import React from 'react';
import { Grid, IconButton, IOClose } from '@grandlinex/react-components';
import { useAppDispatch } from '@/store';
import { setModal } from '@/store/MovieStore';

export default function BaseModal(props: {
  title: string;
  children: React.ReactNode[] | React.ReactNode;
  divRef?: React.RefObject<HTMLDivElement>;
  disableClose?: boolean;
}) {
  const { children, title, divRef, disableClose } = props;
  const dispatch = useAppDispatch();
  return (
    <Grid divRef={divRef} flex className="s-modal" center>
      <Grid className="form-wrapper" flex flexC gap={12}>
        <Grid flex flexR gap={4} flexSpaceB>
          <h1>{title}</h1>
          <IconButton
            disabled={disableClose}
            onClick={() => dispatch(setModal(null))}
          >
            <IOClose />
          </IconButton>
        </Grid>
        {children}
      </Grid>
    </Grid>
  );
}

BaseModal.defaultProps = {
  divRef: undefined,
  disableClose: undefined,
};
