import React from 'react';
import './app.scss';

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

  const init = useAppSelector(selectIsInitG);
  const login = useAppSelector(selectLogin);

  useCookie();

  if (!(window as any).uiInit) {
    // Android App - UIRefreshControl
    (window as any).uiInit = () => {
      dispatch(setInit(false));
    };
  }

  if (!init || !login) {
    return <LoginWeb />;
  }
  return <Main />;
};
export default App;
