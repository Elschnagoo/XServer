import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import { createRoot } from 'react-dom/client';
import { store } from '@/store/store';
import GlobalContext from './context/GlobalContext';
import { defaultHandler } from '@/context/WebFHandler';
import App from '@/app';
import Root from '@/component/Root';

const root = createRoot(document.getElementById('root')!);

root.render(
  <Root>
    <ToastContainer
      position="top-right"
      autoClose={6000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <GlobalContext.Provider value={defaultHandler}>
      <Provider store={store}>
        <App />
      </Provider>
    </GlobalContext.Provider>
  </Root>
);
