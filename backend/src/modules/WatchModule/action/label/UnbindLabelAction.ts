import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';

@SPath({
  '/movie/label/{id}': {
    delete: {
      tags: ['Watch'],
      operationId: 'unbindLabel',
      summary: 'Unbind label from movie',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      responses: SPathUtil.defaultResponse('200', '400', '404', '500'),
    },
  },
})
export default class UnbindLabelAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('DELETE', '/movie/label/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();
      const label = await db.labelMap.getObjById(req.params.id);

      if (!label) {
        res.sendStatus(404);
        return;
      }

      await db.labelMap.delete(label.e_id);

      res.sendStatus(200);
      return;
    }

    res.sendStatus(403);
  }
}
