import React, { useMemo } from 'react';
import { MovieLib } from '@elschnagoo/xserver-con';
import { toast } from 'react-toastify';
import {
  CheckBox,
  getIcon,
  Grid,
  ISize,
  Tooltip,
  useQData,
} from '@grandlinex/react-components';
import StarCompV2 from '@/component/StarCompV2';
import { useGlobalContext } from '@/context/GlobalContext';
import { useAppSelector } from '@/store';
import { selectRating } from '@/store/MovieStore';

function cr(rating: number | undefined) {
  let rat = rating ?? 0;
  if (rat < 0) {
    rat = 0;
  }
  return rat;
}
export default function RatingComp({
  option,
  className,
}: Readonly<{
  className?: string;
  option: {
    mov: MovieLib;
    edit: boolean;
    update: (mov: MovieLib) => void;
    close: () => void;
  };
}>) {
  const { mov, edit, update, close } = option;
  const ratings = useAppSelector(selectRating);
  const context = useGlobalContext();
  const max = useMemo(
    () => ratings?.reduce((a, b) => a + b.rating_value, 0) ?? 0,
    [ratings],
  );

  const [rData, , reload] = useQData(async () => {
    return (await context.getMovieRating(mov.e_id)).data ?? [];
  });
  const maxCur = useMemo(
    () =>
      rData?.reduce((a, b) => {
        const rat = ratings?.find((x) => b.element === x.e_id);
        if (rat && rat.rating_type === 'BOOL') {
          return a + cr(b.rating_value) * rat.rating_value;
        }
        if (rat && rat.rating_type === 'STAR') {
          return a + cr(b.rating_value / 5) * rat.rating_value;
        }
        return a;
      }, 0) ?? 0,
    [rData, ratings],
  );
  const perc = useMemo(() => maxCur / max, [maxCur, max]);
  const calcR = useMemo(() => 5 * perc, [perc]);
  if (!edit) {
    return null;
  }
  return (
    <Grid flex flexC className={className}>
      <StarCompV2
        message={{
          text: 'Total',
          tooltip: `Total rating (${maxCur}/${max})[${Math.trunc(
            perc * 100,
          )}%,${calcR.toFixed(2)}]`,
        }}
        start={mov.rating}
        onChange={(n) => {
          context.updateMovie(option.mov.e_id, { rating: n }).then((res) => {
            if (!res.success || !res.data) {
              toast.error(`Error`);
            } else {
              update(res.data);
              reload();
              close();
            }
          });
        }}
      />
      {ratings && <hr style={{ width: '100%' }} />}
      {ratings?.map((e) => {
        const cur = rData?.find((x) => x.element === e.e_id);
        if (e.rating_type === 'STAR') {
          return (
            <StarCompV2
              message={{
                text: (
                  <span>
                    {e.rating_label}
                    {!cur && <span style={{ color: 'lightblue' }}> *</span>}
                  </span>
                ),
                tooltip: `Rating weight: ${Math.trunc(
                  (cr(cur?.rating_value) / 5) * e.rating_value,
                )}/${e.rating_value}`,
              }}
              icon={e.icon as any}
              start={cur?.rating_value}
              onChange={(n) => {
                context
                  .setMovieRating(option.mov.e_id, {
                    element: e.e_id,
                    rating: n,
                  })
                  .then((res) => {
                    if (!res.success || !res.data) {
                      toast.error(`Error`);
                    } else {
                      reload();
                      update(res.data);
                    }
                  });
              }}
            />
          );
        }
        if (e.rating_type === 'BOOL') {
          return (
            <Grid
              flex
              flexRow
              hCenter
              flexSpaceB
              className="star-rating glx-flex-wrap"
            >
              <Grid flexR vCenter className="star-text">
                {e.icon &&
                  getIcon(e.icon as any)({
                    size: ISize.SM,
                  })}
                <Tooltip
                  text={`Rating weight: ${Math.trunc(
                    cr(cur?.rating_value) * e.rating_value,
                  )}/${e.rating_value}`}
                >
                  {e.rating_label}
                  {!cur && <span style={{ color: 'lightblue' }}> *</span>}
                </Tooltip>
              </Grid>
              <CheckBox
                checked={!!cur?.rating_value}
                value={!!cur?.rating_value}
                onChange={(c) => {
                  context
                    .setMovieRating(option.mov.e_id, {
                      element: e.e_id,
                      rating: c ? 1 : 0,
                    })
                    .then((res) => {
                      if (!res.success || !res.data) {
                        toast.error(`Error`);
                      } else {
                        reload();
                        update(res.data);
                      }
                    });
                }}
              />
            </Grid>
          );
        }
        return null;
      })}
    </Grid>
  );
}
RatingComp.defaultProps = {
  className: undefined,
};
