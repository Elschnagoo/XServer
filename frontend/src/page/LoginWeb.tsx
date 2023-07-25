import React, { useEffect, useState } from 'react';

import {
  Form,
  Grid,
  InputOptionType,
  LDots,
  usePathQueryMap,
} from '@grandlinex/react-components';
import { setAppStore, setInit, useAppDispatch } from '@/store';

import { useGlobalContext } from '@/context/GlobalContext';
import { parseJwtLegacy } from '@/lib/ParseJWT';
import { Views } from '@/lib';
import LocalStorage from '@/utils/LocalStorage';

const LoginWeb: React.FC<any> = function () {
  const dispatch = useAppDispatch();
  const context = useGlobalContext();
  const query = usePathQueryMap();
  const [skipLS, setSkipLS] = useState<boolean>(false);

  async function setupAppEnv(): Promise<void> {
    const jwt = parseJwtLegacy(context.token() || '');
    context.env.login = true;
    context.env.init = true;
    context.env.token = context.token();
    context.env.endpoint = context.api;
    context.env.view = Views.HOME;
    context.env.connected = true;
    context.env.userName = jwt?.username || 'error';
    context.env.userId = jwt?.userid || 'error';
  }

  useEffect(() => {
    (async () => {
      const tok = LocalStorage.load('token');
      if (!context.env.login && tok && !skipLS) {
        context.authorization = tok;
        context.disconnected = false;
        if (await context.testToken()) {
          await setupAppEnv();
          dispatch(setAppStore(context.env));
          dispatch(setInit(true));
        } else {
          LocalStorage.delete('token');
        }
      }
      if (!skipLS) {
        setSkipLS(true);
      }
    })();
  });

  if (query.has('m') || LocalStorage.load('token') !== '') {
    return (
      <div className="row wizard">
        <Grid className="item" flex flexC hCenter vCenter>
          <div style={{ width: '62px' }}>
            <LDots />
          </div>
        </Grid>
      </div>
    );
  }
  return (
    <div className="row wizard">
      <div className="item">
        <Form
          options={[
            [
              {
                label: 'Password',
                key: 'password',
                type: InputOptionType.PASSWORD,
                submitOnEnter: true,
              },
            ],
          ]}
          submit={{
            loading: true,
            onSubmit: async ({ form, setError, clear }) => {
              setError(null);
              if (!(await context.connect('admin', form.password))) {
                setError({ global: ['ERROR-CON'] });
              } else {
                await setupAppEnv();
                LocalStorage.save('token', context.authorization || '');
                dispatch(setAppStore(context.env));
                dispatch(setInit(true));
              }
              if (!skipLS) {
                setSkipLS(true);
              }
            },
            buttonCenter: true,
            buttonText: 'Login',
          }}
        />
      </div>
    </div>
  );
};
export default LoginWeb;
