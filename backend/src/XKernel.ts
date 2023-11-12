import Path, * as path from 'path';
import Kernel, {
  CoreModule,
  cors,
  KernelEndpoint,
  Swagger,
  XRequest,
  XUtil,
} from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';
import ELogger from '@grandlinex/bundle-elogger';

import e from 'express';
import SwaggerConf from './SwaggerConf';
import WatchModule from './modules/WatchModule/WatchModule';
import YTDLMod from './modules/YTDL/YTDLMod';

const appName = 'XServer';
const appCode = 'x-server';
const root = Path.join(__dirname, '..');

/**
 * (@) testPath are the place for storing temp files, db data and configuration
 */
const testPath = Path.join(root, 'data', 'config');

const rootPath = Path.join(testPath, appName);
const media = Path.join(rootPath, 'media');
const download = Path.join(rootPath, 'download');
const resPath = Path.join(root, 'res');

const apiPort = 9257;
/**
 * Extending GrandLineX with your own kernel interface for your needs
 */
@Swagger(SwaggerConf)
export default class XKernel extends Kernel {
  constructor(dev = false) {
    super({
      appName,
      appCode,
      pathOverride: testPath,
      envFilePath: root,
      loadFromLocalEnv: true,
      logger: (k) => new ELogger(k),
    });
    /**
     * Register the new Module in Kernel
     */
    const store = this.getConfigStore();

    this.setDevMode(true);

    this.setCoreModule(new CoreModule(this, (mod) => new PGCon(mod, '0')));

    store.set('MEDIA_PATH', media);
    store.set('RES_PATH', resPath);
    store.set('DOWNLOAD_PATH', download);

    this.addModule(new YTDLMod(this), new WatchModule(this));

    let loadOnce = false;
    this.setTriggerFunction('load', async (ik) => {
      if (!loadOnce) {
        loadOnce = true;
        const ep = ik.getModule().getPresenter() as KernelEndpoint;
        const app = ep.getApp();
        app.use(cors);
        app.use(e.static(path.join(root, 'public', 'ui')));
      }
    });

    this.setTriggerFunction('pre', async (ik) => {
      XUtil.createFolderIfNotExist(media);
      XUtil.createFolderIfNotExist(download);
    });

    /**
     * Overwrite the default app server port
     */
    this.setAppServerPort(apiPort);
  }

  responseCodeFunction(data: { code: number; req: XRequest }) {
    const { code } = data;
    if (code < 200 || code >= 400) {
      this.verbose(data.req.path, data.req.ip, data.code);
    }
  }
}
