import React from 'react';
import { Grid, LPulse } from '@grandlinex/react-components';

export default function LoadingComp({
  children,
  loading,
}: {
  children?: React.ReactNode | React.ReactNode[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Grid flex flexRow hCenter>
        <LPulse />
      </Grid>
    );
  }
  return children;
}
LoadingComp.defaultProps = {
  children: undefined,
};
