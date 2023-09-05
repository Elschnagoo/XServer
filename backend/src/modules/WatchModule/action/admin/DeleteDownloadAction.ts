import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  JwtToken,
  XRequest,
  XResponse,
} from '@grandlinex/kernel';

import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
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

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null,
  ): Promise<void> {
    const db = this.getModule().getDb();
    const done = await db.download.getObjList({
      search: { state: StateTypeQEnum.DONE },
    });
    for (const d of done) {
      await db.download.delete(d.e_id);
    }

    res.sendStatus(200);
  }
}
