import React, { useEffect, useMemo, useState } from 'react';

export default function ImgCarousel({ data }: { data: [string, string][] }) {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const cur = useMemo<[string, string] | undefined>(
    () => data[index],
    [data, index],
  );
  useEffect(() => {
    const timer = setInterval(() => {
      if (running) {
        setIndex((i) => (i + 1) % data.length);
      }
    }, 2000);
    return () => clearInterval(timer);
  });
  return (
    <div
      className="hide-on-mobile"
      onMouseEnter={() => setRunning(true)}
      onMouseLeave={() => setRunning(false)}
    >
      {cur ? (
        <img key={`c_${cur[0]}`} src={cur[1]} loading="lazy" alt="" />
      ) : null}
    </div>
  );
}
