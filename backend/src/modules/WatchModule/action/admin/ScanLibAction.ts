import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  JwtToken,
} from '@grandlinex/kernel';
import e from 'express';

import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { WatchDB } from '../../database';
import ScannerQ from '../../database/queue/ScannerQ';
import { StateTypeQEnum } from '../../database/queue/StateTypeQ';

@SPath({
  '/lib/scan': {
    post: {
      summary: 'Add scan job to queue',
      tags: ['Watch'],
      operationId: 'addScanJob',
      responses: SPathUtil.defaultResponse('200', '403', '500'),
    },
  },
})
export default class ScanLibAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('POST', '/lib/scan', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: e.Request,
    res: e.Response,
    next: () => void,
    data: JwtToken
  ): Promise<void> {
    const db = this.getModule().getDb();
    const list = await db.lib.getObjList();

    try {
      for (const lib of list) {
        await db.scanQ.createObject(
          new ScannerQ({
            created: new Date(),
            error: null,
            lib: lib.e_id,
            state: StateTypeQEnum.PENDING,
          })
        );
      }
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(500);
    }
  }
}
