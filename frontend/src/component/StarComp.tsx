import React, { useEffect, useState } from 'react';
import { MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import {
  Grid,
  IOBackspaceOutline,
  IOStar,
  IOStarOutline,
  ISize,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';

const Star = [0, 1, 2, 3, 4];
export default function StarComp(props: {
  option?: {
    mov: MovieLib;
    edit: boolean;
    update: (mov: MovieLib) => void;
    close: () => void;
  };
  onChange?: (val: number) => void;
}) {
  const { option, onChange } = props;
  const [init, setInit] = useState<number | undefined>(option?.mov.rating || 0);
  const [cur, setCur] = useState<number>((option?.mov.rating || 0) - 1);
  const [curHover, setCurHover] = useState<number>(
    (option?.mov.rating || 0) - 1,
  );
  const context = useGlobalContext();

  useEffect(() => {
    if (init !== option?.mov.rating) {
      setCur((option?.mov.rating || 0) - 1);
      setCurHover((option?.mov.rating || 0) - 1);
    }
    setInit(option?.mov.rating);
  }, [init, option?.mov.rating]);

  if (option?.edit || !option) {
    return (
      <Grid
        flex
        flexR
        hCenter
        vCenter
        className="star-rating"
        onMouseLeave={() => setCurHover(-1)}
      >
        {Star.map((key, index) => {
          return (
            <div
              className="glx-pointer"
              onMouseEnter={() => setCurHover(index)}
              onMouseLeave={() => setCurHover(-1)}
              onClick={() => {
                setCur(index);

                onChange?.(index + 1);
                if (option) {
                  context
                    .updateMovie(option.mov.e_id, { rating: index + 1 })
                    .then((res) => {
                      if (!res.success || !res.data) {
                        toast.error(`Fehler`);
                      } else {
                        option.update(res.data);
                        option.close();
                        // toast.success(`Bewertung gespeichert: ${index + 1}`);
                      }
                    });
                }
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
          className="star-reset glx-pointer"
          onClick={() => {
            onChange?.(-1);
            setCur(-1);
            if (option) {
              context
                .updateMovie(option.mov.e_id, { rating: -1 })
                .then((res) => {
                  if (!res.success || !res.data) {
                    toast.error(`Fehler`);
                  } else {
                    option.update(res.data);
                    option.close();
                  }
                });
            }
          }}
        >
          <IOBackspaceOutline size={ISize.MD} />
        </div>
      </Grid>
    );
  }
  return null;
}

StarComp.defaultProps = {
  option: undefined,
  onChange: undefined,
};
