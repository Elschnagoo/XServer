import React, { ReactNode } from 'react';
import { cnx, usePathQueryMap } from '@grandlinex/react-components';

export default function Root({ children }: { children: ReactNode }) {
  const query = usePathQueryMap();

  return (
    <div className={cnx('root', [query.has('m'), 'root-mobile'])}>
      {children}
    </div>
  );
}
