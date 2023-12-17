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
import WatchClient from '../../client/WatchClient';

@SPath({
  '/label-lookup': {
    post: {
      tags: ['Watch'],
      operationId: 'lookupLabels',
      summary: 'Lookup label by text',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          text: {
            type: 'string',
          },
        },
        required: ['text'],
      }),
      responses: SPathUtil.refResponse(
        '200',
        new Label(),
        true,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class LabelLookupAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('POST', '/label-lookup', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const client = this.getModule().getClient();

      res.status(200).send(await client.labelFromString(req.body.text || ''));
      return;
    }

    res.sendStatus(403);
  }
}
