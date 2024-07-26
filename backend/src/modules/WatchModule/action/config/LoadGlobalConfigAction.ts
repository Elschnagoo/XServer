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
  '/admin/config/{key}': {
    get: {
      tags: ['Watch'],
      operationId: 'getGlobalConfig',
      summary: 'Get string config',
      parameters: [
        {
          in: 'path',
          name: 'key',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      responses: SPathUtil.jsonResponse(
        '200',
        {
          type: 'object',
          properties: {
            c_key: {
              type: 'string',
            },
            c_value: {
              type: 'string',
            },
          },
          required: ['c_key', 'c_value'],
        },
        false,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class LoadGlobalConfigAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('GET', '/admin/config/:key', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req }: XActionEvent): Promise<void> {
    const { key } = req.params;
    if (!key) {
      res.sendStatus(400);
      return;
    }
    const db = this.getModule().getDb();
    const config = await db.getConfig(key);
    if (config) {
      res.status(200).send(config);
    } else {
      res.sendStatus(404);
    }
  }
}
