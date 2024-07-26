import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import WatchClient from '../../client/WatchClient';

@SPath({
  '/admin/config': {
    post: {
      tags: ['Watch'],
      operationId: 'saveGlobalConfig',
      summary: 'Save string config',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          key: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
        },
        required: ['key', 'value'],
      }),
      responses: SPathUtil.defaultResponse('200', '400', '404', '500'),
    },
  },
})
export default class SaveGlobalConfigAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('POST', '/admin/config', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req }: XActionEvent): Promise<void> {
    const { body } = req;
    const { key, value } = body;
    if (!key || !value) {
      res.sendStatus(400);
      return;
    }
    const db = this.getModule().getDb();
    await db.setConfig(key, value);
    res.sendStatus(200);
  }
}
