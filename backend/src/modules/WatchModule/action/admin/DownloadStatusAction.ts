import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import DownloadQ from '../../database/queue/DownloadQ';

@SPath({
  '/download': {
    get: {
      tags: ['Watch'],
      operationId: 'getDownloadQ',
      summary: 'Get download queue',
      responses: SPathUtil.refResponse(
        '200',
        new DownloadQ(),
        true,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class DownloadStatusAction extends BaseApiAction<
  IKernel,
  WatchDB
> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/download', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, data }: XActionEvent): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();
      const dat = await db.download.getObjList();

      if (!dat) {
        res.sendStatus(404);
        return;
      }

      res.status(200).send(dat);
      return;
    }

    res.sendStatus(403);
  }
}
