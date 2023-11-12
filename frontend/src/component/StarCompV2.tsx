import React, { useEffect, useState } from 'react';
import {
  getIcon,
  Grid,
  INames,
  IOBackspaceOutline,
  IOStar,
  IOStarOutline,
  ISize,
  Tooltip,
} from '@grandlinex/react-components';

const Star = [0, 1, 2, 3, 4];
export default function StarCompV2({
  start,
  onChange,
  message,
  icon,
}: {
  onChange?: (val: number) => void;
  start?: number;
  icon?: INames;
  message?: { text: string; tooltip: string };
}) {
  const [init, setInit] = useState<number | undefined>(start ?? 0);
  const [cur, setCur] = useState<number>((start ?? 0) - 1);
  const [curHover, setCurHover] = useState<number>((start || 0) - 1);

  useEffect(() => {
    if (init !== start) {
      setCur((start || 0) - 1);
      setCurHover((start || 0) - 1);
    }
    setInit(start);
  }, [init, start]);

  return (
    <Grid
      flex
      flexR
      hCenter
      vCenter
      className="star-rating glx-flex-wrap"
      onMouseLeave={() => setCurHover(-1)}
      flexSpaceB
    >
      {(message || icon) && (
        <Grid flexR vCenter className="star-text">
          {icon &&
            getIcon(icon)({
              size: ISize.SM,
            })}
          {message && <Tooltip text={message.tooltip}>{message.text}</Tooltip>}
        </Grid>
      )}
      <Grid flex flexR>
        {Star.map((key, index) => {
          return (
            <div
              className="glx-pointer"
              onMouseEnter={() => setCurHover(index)}
              onMouseLeave={() => setCurHover(-1)}
              onClick={() => {
                setCur(index);

                onChange?.(index + 1);
              }}
            >
              {index <= curHover || (curHover === -1 && index <= cur) ? (
                <IOStar size={ISize.MD} />
              ) : (
                <IOStarOutline size={ISize.MD} />
              )}
            </div>
          );
        })}
        <div
          className="star-reset glx-pointer glx-pl-4"
          onClick={() => {
            onChange?.(-1);
            setCur(-1);
          }}
        >
          <IOBackspaceOutline size={ISize.MD} />
        </div>
      </Grid>
    </Grid>
  );
}

StarCompV2.defaultProps = {
  start: undefined,
  onChange: undefined,
  message: undefined,
  icon: undefined,
};
