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
  '/label': {
    post: {
      tags: ['Watch'],
      operationId: 'postLabel',
      summary: 'Create new label',
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
        required: ['label_name'],
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
export default class NewLabelAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('POST', '/label', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();
      const { label_name, icon, color, label_order } = req.body;
      if (
        !label_name ||
        typeof label_name !== 'string' ||
        (!!icon && typeof icon !== 'string') ||
        (!!color && typeof color !== 'string') ||
        (label_order !== undefined && typeof label_order !== 'number')
      ) {
        res.sendStatus(400);
        return;
      }
      if (await db.label.findObj({ label_name })) {
        res.sendStatus(409);
        return;
      }
      const l = await db.label.createObject(
        new Label({
          label_name,
          icon: icon || null,
          color: color || null,
          label_order: label_order ?? 10,
        }),
      );
      res.status(200).send(l);
      return;
    }

    res.sendStatus(403);
  }
}
