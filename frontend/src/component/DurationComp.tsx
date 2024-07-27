import React from 'react';

export default function DurationComp(props: { dur?: number }) {
  const { dur } = props;
  if (!dur) {
    return null;
  }
  const durF = Math.trunc(dur / 60);
  return <i>{durF} min</i>;
}
