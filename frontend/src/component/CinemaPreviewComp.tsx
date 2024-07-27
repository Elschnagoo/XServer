import React, { useMemo, useState } from 'react';
import { MovieLib } from '@elschnagoo/xserver-con';
import { MediaPlayer } from '@grandlinex/react-components/dist/components/mediaPlayer/MediaPlayer';
import {
  Grid,
  IconButton,
  IOFlash,
  IOFlashOff,
} from '@grandlinex/react-components';
import VideoPreview from '@/component/VideoPreview';
import useAuthHelper from '@/utils/AuthUtil';
import { usePlayMode } from '@/store';

export default function CinemaPreviewComp({
  mov,
  onClick,
  trace,
}: {
  mov: MovieLib;
  trace: string;
  onClick: () => void;
}) {
  const authHelper = useAuthHelper();
  const mode = usePlayMode();

  const stream = useMemo(() => {
    return authHelper(
      `/movie/stream/${mov.e_id}?trace=${trace}${mode()}`,
      true,
    );
  }, [authHelper, mov.e_id, mode, trace]);
  const [play, setPlay] = useState(false);
  const isSupported = useMemo(() => {
    return !!mov.video?.supported && !!mov.audio?.supported;
  }, [mov]);
  return (
    <div className="cinema-preview" onClick={onClick}>
      <Grid flex flexR className="cinema-preview-name" gap={8} vCenter>
        <div>{isSupported ? <IOFlash /> : <IOFlashOff />}</div>
        <div>
          <b>{mov.movie_name}</b>
        </div>
      </Grid>
      <div className="cinema-preview-play">
        <IconButton
          icon={play ? 'IOPause' : 'IOPlay'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPlay(!play);
          }}
        />
      </div>
      {!play ? (
        <VideoPreview eid={mov.e_id} force />
      ) : (
        <div className="video-preview">
          <MediaPlayer
            src={stream}
            poster={undefined}
            loop
            autoplay
            controls={false}
          />
        </div>
      )}
    </div>
  );
}
