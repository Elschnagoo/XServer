import React, { ReactNode, StrictMode } from 'react';
import { cnx, usePathQueryMap } from '@grandlinex/react-components';

export default function Root({ children }: { children: ReactNode }) {
  const query = usePathQueryMap();

  return (
    <StrictMode>
      <div id="mount" className={cnx('root', [query.has('m'), 'root-mobile'])}>
        {children}
      </div>
    </StrictMode>
  );
}
