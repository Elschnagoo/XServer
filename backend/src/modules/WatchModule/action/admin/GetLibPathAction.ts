import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import LibPath from '../../database/entities/LibPath';

@SPath({
  '/lib': {
    get: {
      summary: 'Get lib path',
      tags: ['Watch'],
      operationId: 'getLibPath',
      responses: SPathUtil.refResponse(
        '200',
        new LibPath(),
        true,
        '500',
        '404',
      ),
    },
  },
})
export default class GetLibPathAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/lib', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res }: XActionEvent): Promise<void> {
    const db = this.getModule().getDb();
    const p = await db.path.getObjList();
    res.status(200).send(p);
  }
}
