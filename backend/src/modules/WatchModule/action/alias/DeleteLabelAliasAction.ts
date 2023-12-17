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
  '/alias/{id}': {
    delete: {
      tags: ['Watch'],
      operationId: 'deleteAlias',
      summary: 'Delete label alias',
      parameters: [
        {
          required: true,
          name: 'id',
          in: 'path',
        },
      ],
      responses: SPathUtil.defaultResponse('200', '400', '404', '500'),
    },
  },
})
export default class DeleteLabelAliasAction extends BaseApiAction<
  IKernel,
  WatchDB
> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('DELETE', '/alias/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const { id } = req.params;
      const db = this.getModule().getDb();

      const cur = await db.labelAlias.getObjById(id);
      if (!cur) {
        res.sendStatus(404);
        return;
      }
      await db.labelAlias.delete(cur.e_id);
      res.sendStatus(200);
      return;
    }

    res.sendStatus(403);
  }
}
