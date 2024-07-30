import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import { StateTypeQEnum } from '../../database/queue/StateTypeQ';

@SPath({
  '/download': {
    delete: {
      tags: ['Watch'],
      operationId: 'deleteDownloadMedia',
      summary: 'Delete Download Media',
      responses: SPathUtil.defaultResponse('200', '400', '404', '500'),
    },
  },
})
export default class DeleteDownloadAction extends BaseApiAction<
  IKernel,
  WatchDB
> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('DELETE', '/download', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res }: XActionEvent): Promise<void> {
    const db = this.getModule().getDb();
    const done = await db.download.getObjList({
      search: { state: StateTypeQEnum.DONE },
    });
    await db.download.deleteBulk(done.map((d) => d.e_id));

    res.sendStatus(200);
  }
}
