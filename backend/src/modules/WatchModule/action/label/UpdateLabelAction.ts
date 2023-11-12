import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import Label from '../../database/entities/Label';

@SPath({
  '/label/{id}': {
    patch: {
      tags: ['Watch'],
      operationId: 'updateLabel',
      summary: 'Update label',
      parameters: [
        {
          required: true,
          name: 'id',
          in: 'path',
        },
      ],
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          label_name: {
            type: 'string',
          },
          icon: {
            type: 'string',
          },
          color: {
            type: 'string',
          },
          label_order: {
            type: 'integer',
          },
        },
      }),
      responses: SPathUtil.refResponse(
        '201',
        new Label(),
        false,
        '400',
        '404',
        '409',
        '500',
      ),
    },
  },
})
export default class UpdateLabelAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('PATCH', '/label/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const { id } = req.params;
      const db = this.getModule().getDb();
      const { label_name, icon, color, label_order } = req.body;
      if (
        (!!label_name && typeof label_name !== 'string') ||
        (!!icon && typeof icon !== 'string') ||
        (!!color && typeof color !== 'string') ||
        (label_order !== undefined && typeof label_order !== 'number')
      ) {
        res.sendStatus(400);
        return;
      }
      const cur = await db.label.getObjById(id);
      if (!cur) {
        res.sendStatus(404);
        return;
      }
      const l = await db.label.updateObject(cur.e_id, {
        label_name,
        icon,
        color,
        label_order,
      });
      res.status(200).send(l);
      return;
    }

    res.sendStatus(403);
  }
}
