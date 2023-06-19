import { ApiCon, FetchCon } from '@elschnagoo/xserver-con';
import { getDocumentMeta } from '@grandlinex/react-components';
import { AppEnv, Views } from '@/lib';
import BaseFHandler from '@/context/BaseFHandler';

export default class WebFHandler extends ApiCon implements BaseFHandler {
  env: AppEnv;

  name: string;

  constructor(endpoint?: string) {
    super({ con: FetchCon, endpoint: endpoint || '' });

    this.name = 'web';

    this.env = {
      login: false,
      isNew: false,
      userName: '',
      userId: '',
      token: '',
      endpoint: endpoint || '',
      init: true,
      view: Views.LOGIN,
      connected: false,
    };
  }

  getName(): string {
    return 'web';
  }

  async logOut(): Promise<any> {
    this.env.token = '';
    window.localStorage.removeItem('token');
    window.location.reload();
  }

  async openExternalConfig(conf: {
    url: string;
    external?: boolean;
  }): Promise<void> {
    if (window.location.search.includes('m=true')) {
      window.location = `intent:${conf.url}#Intent;end` as any;
    } else {
      window.open(conf.url, conf.external ? '_blank' : '_self');
    }
  }

  async preloadEnv(): Promise<AppEnv> {
    return this.env;
  }
}
const defaultHandler = new WebFHandler();
const c_name = getDocumentMeta('REACT_C_NAME');
if (c_name === 'DEV') {
  defaultHandler.api = 'http://localhost:9257';
} else {
  defaultHandler.api = window.location.origin || '';
}

export { defaultHandler };
