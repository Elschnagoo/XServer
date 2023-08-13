import React, { useMemo } from 'react';
import { cnx, Grid, IconButton, IOClose } from '@grandlinex/react-components';
import { MediaPlayer } from '@grandlinex/react-components/dist/components/mediaPlayer/MediaPlayer';
import useAuthHelper from '@/utils/AuthUtil';
import { selectMulti, setModal } from '@/store/MovieStore';
import { useAppDispatch, useAppSelector } from '@/store';

export default function MultiView() {
  const authHelper = useAuthHelper();
  const dispatch = useAppDispatch();
  const list = useAppSelector(selectMulti);
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
        {pList.slice(0, 4).map(([id, steam, poster]) => (
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
        <IconButton
          onClick={() => {
            try {
              const doc = document as any;
              dispatch(setModal(null));
              if (doc.exitFullscreen) {
                doc.exitFullscreen();
              } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
              } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
              } else if (doc.webkitCancelFullScreen) {
                doc.webkitCancelFullScreen();
              }
            } catch (e) {
              console.warn(e);
            }
          }}
        >
          <IOClose />
        </IconButton>
      </div>
    </>
  );
}
