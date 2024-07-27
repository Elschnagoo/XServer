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
  '/movie/label/{mov}/{id}': {
    delete: {
      tags: ['Watch'],
      operationId: 'unbindLabel',
      summary: 'Unbind label from movie',
      parameters: [
        {
          in: 'path',
          name: 'mov',
          required: true,
          schema: {
            type: 'string',
          },
        },
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
    super(
      'DELETE',
      '/movie/label/:mov/:id',
      module,
      module.getKernel().getModule(),
    );
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req }: XActionEvent): Promise<void> {
    const db = this.getModule().getDb();
    const { mov, id } = req.params;
    const label = await db.labelMap.findObj({
      mov_lib: mov,
      label: id,
    });

    if (!label) {
      res.sendStatus(404);
      return;
    }

    await db.labelMap.delete(label.e_id);

    res.sendStatus(200);
  }
}
