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
  mov: MovieLib;
  edit: boolean;
  update: (mov: MovieLib) => void;
  close: () => void;
}) {
  const { mov, edit, update, close } = props;
  const [init, setInit] = useState<number | undefined>(mov.rating);
  const [cur, setCur] = useState<number>((mov.rating || 0) - 1);
  const [curHover, setCurHover] = useState<number>((mov.rating || 0) - 1);
  const context = useGlobalContext();

  useEffect(() => {
    if (init !== mov.rating) {
      setCur((mov.rating || 0) - 1);
      setCurHover((mov.rating || 0) - 1);
    }
    setInit(mov.rating);
  }, [init, mov.rating]);

  if (edit) {
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
                context
                  .updateMovie(mov.e_id, { rating: index + 1 })
                  .then((res) => {
                    if (!res.success || !res.data) {
                      toast.error(`Fehler`);
                    } else {
                      update(res.data);
                      close();
                      // toast.success(`Bewertung gespeichert: ${index + 1}`);
                    }
                  });
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
            context.updateMovie(mov.e_id, { rating: -1 }).then((res) => {
              if (!res.success || !res.data) {
                toast.error(`Fehler`);
              } else {
                update(res.data);
                close();
              }
            });
          }}
        >
          <IOBackspaceOutline size={ISize.MD} />
        </div>
      </Grid>
    );
  }
  return null;
}
