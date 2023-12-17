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
  '/alias': {
    post: {
      tags: ['Watch'],
      operationId: 'postAlias',
      summary: 'Create new label Alias',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          label: {
            type: 'string',
          },
          alias: {
            type: 'string',
          },
        },
        required: ['label', 'alias'],
      }),
      responses: SPathUtil.refResponse(
        '201',
        new LabelAlias(),
        false,
        '400',
        '404',
        '409',
        '500',
      ),
    },
  },
})
export default class NewLabelAliasAction extends BaseApiAction<
  IKernel,
  WatchDB
> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('POST', '/alias', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();
      const { label, alias } = req.body;
      if (
        (!!label && typeof label !== 'string') ||
        (!!alias && typeof alias !== 'string')
      ) {
        res.sendStatus(400);
        return;
      }
      const al = alias.toLowerCase();
      if (await db.labelAlias.findObj({ label, alias: al })) {
        res.sendStatus(409);
        return;
      }
      if (!(await db.label.getObjById(label))) {
        res.sendStatus(404);
        return;
      }

      const l = await db.labelAlias.createObject(
        new LabelAlias({ label, alias: al }),
      );
      res.status(200).send(l);
      return;
    }
    res.sendStatus(403);
  }
}
