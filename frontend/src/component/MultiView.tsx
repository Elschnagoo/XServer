import React, { useMemo } from 'react';
import { cnx, Grid, IconButton, IOClose } from '@grandlinex/react-components';
import { MediaPlayer } from '@grandlinex/react-components/dist/components/mediaPlayer/MediaPlayer';
import useAuthHelper from '@/utils/AuthUtil';

export default function MultiView({
  list,
  close,
}: {
  list: string[];
  close: () => void;
}) {
  const authHelper = useAuthHelper();

  const pList = useMemo(() => {
    return list.map((v) => [
      v,
      authHelper(`/movie/stream/${v}`, true),
      authHelper(`/movie/img/${v}?type=tn_1`, true),
    ]);
  }, [authHelper, list]);
  return (
    <>
      <Grid flex flexR className="multi-view glx-flex-wrap">
        {pList.map(([id, steam, poster]) => (
          <div
            id={`${id}_steam`}
            className={cnx(
              [pList.length === 1, 'multi-el-single'],
              [pList.length === 2, 'multi-el-dual'],
              [pList.length > 2, 'multi-el'],
            )}
          >
            <MediaPlayer src={steam} poster={poster} />
          </div>
        ))}
      </Grid>
      <div className="multi-close">
        <IconButton onClick={close}>
          <IOClose />
        </IconButton>
      </div>
    </>
  );
}
