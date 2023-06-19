import React from 'react';

export default function DurationComp(props: { dur?: string }) {
  const { dur } = props;
  if (!dur) {
    return null;
  }
  const durF = Math.trunc(parseFloat(dur) / 60);
  return <i>{durF} min</i>;
}
DurationComp.defaultProps = {
  dur: undefined,
};
