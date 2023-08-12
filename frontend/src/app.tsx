import React, { useMemo } from 'react';
import './app.scss';

import {
  UIContext,
  UIContextData,
  usePathQueryMap,
} from '@grandlinex/react-components';
import {
  selectIsInitG,
  selectLogin,
  setInit,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { useCookie } from '@/utils/CookieUtil';
import LoginWeb from '@/page/LoginWeb';
import Main from '@/page/Main';

const App: React.FC = function () {
  const dispatch = useAppDispatch();
  const query = usePathQueryMap();
  const init = useAppSelector(selectIsInitG);
  const login = useAppSelector(selectLogin);

  const data = useMemo(
    () =>
      new UIContextData({
        tooltipDisabled: query.has('m'),
      }),
    [query],
  );

  useCookie();

  if (!(window as any).uiInit) {
    // Android App - UIRefreshControl
    (window as any).uiInit = () => {
      dispatch(setInit(false));
    };
  }

  return (
    <UIContext.Provider value={data}>
      {!init || !login ? <LoginWeb /> : <Main />}
    </UIContext.Provider>
  );
};
export default App;
