import {
  CheckBox,
  getIcon,
  Grid,
  INames,
  IOStar,
} from '@grandlinex/react-components';
import React, { useMemo, useState } from 'react';
import { useAppSelector } from '@/store';
import { selectRating } from '@/store/MovieStore';

export default function RatingHelper() {
  const arr = useAppSelector(selectRating);
  const [ratingMx, setRatingMX] = useState<number[]>(
    arr!.map((x) => (x.initial_value ? 1 : 0)),
  );
  const rating = useMemo(() => {
    const max = arr!.map((v) => v.rating_value).reduce((a, b) => a + b, 0);
    let cur = 0;
    ratingMx.forEach((v, i) => {
      cur += v * arr![i].rating_value;
    });
    const raw = (cur / max) * 5;
    const round = Math.round(raw);
    return { cur, max, raw, round };
  }, [ratingMx]);
  if (!arr || arr.length === 0) return null;
  return (
    <Grid flex flexR className="glx-flex-wrap" gap={8}>
      {arr!.map(({ rating_label, icon }, i) => (
        <Grid flex flexR hCenter gap={4}>
          <CheckBox
            checked={!!ratingMx[i]}
            value={!!ratingMx[i]}
            onChange={(v) => {
              const newRating = [...ratingMx];
              newRating[i] = v ? 1 : 0;
              setRatingMX(newRating);
            }}
          />
          {icon ? <div>{getIcon(icon as INames)({})}</div> : null}

          <div
            className="glx-pointer"
            onClick={() => {
              const newRating = [...ratingMx];
              newRating[i] = ratingMx[i] === 1 ? 0 : 1;
              setRatingMX(newRating);
            }}
          >
            {rating_label}
          </div>
        </Grid>
      ))}
      <Grid>
        <b>{rating.round}</b> <IOStar />
      </Grid>
    </Grid>
  );
}
