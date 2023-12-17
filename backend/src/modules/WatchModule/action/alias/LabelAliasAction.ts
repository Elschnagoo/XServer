import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import LabelAlias from '../../database/entities/LabelAlias';

@SPath({
  '/alias/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getLabelAlias',
      summary: 'Get all alias for label',
      parameters: [
        {
          required: true,
          name: 'id',
          description: 'Label id',
          in: 'path',
        },
      ],
      responses: SPathUtil.refResponse(
        '200',
        new LabelAlias(),
        true,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class LabelAliasAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/alias/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();
      const { id } = req.params;

      res.status(200).send(
        await db.labelAlias.getObjList({
          search: {
            label: id,
          },
          order: [{ key: 'alias', order: 'ASC' }],
        }),
      );
      return;
    }

    res.sendStatus(403);
  }
}
