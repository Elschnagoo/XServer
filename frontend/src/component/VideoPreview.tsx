import React, { useMemo, useState } from 'react';
import { MediaPlayer } from '@grandlinex/react-components/dist/components/mediaPlayer/MediaPlayer';
import useAuthHelper from '@/utils/AuthUtil';

export default function VideoPreview({
  eid,
  force,
}: {
  eid: string;
  force?: boolean;
}) {
  const authHelper = useAuthHelper();

  const [running, setRunning] = useState(false);
  const [tm, setTm] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [img, vid] = useMemo(() => {
    const i = authHelper(`/movie/img/${eid}?type=tn_1`, true);
    const v = authHelper(`/movie/img/${eid}?type=tn_x`, true);
    return [i, v];
  }, [authHelper, eid]);

  return (
    <div
      className="video-preview"
      onMouseEnter={() => {
        if (!force) {
          setTm(setTimeout(() => setRunning(true), 1000));
        }
      }}
      onMouseLeave={() => {
        if (!force) {
          if (tm) {
            clearTimeout(tm);
          }
          setRunning(false);
        }
      }}
    >
      {running || force ? (
        <MediaPlayer
          src={vid}
          poster={img}
          loop
          muted
          autoplay
          controls={false}
        />
      ) : (
        <img key="c_tm_0" src={img} loading="lazy" alt="" />
      )}
    </div>
  );
}
VideoPreview.defaultProps = {
  force: false,
};
