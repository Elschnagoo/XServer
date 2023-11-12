import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import RatingElement from '../../database/entities/RatingElement';

@SPath({
  '/rating': {
    post: {
      tags: ['Watch'],
      operationId: 'postRating',
      summary: 'Create new rating element',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          rating_label: {
            type: 'string',
          },
          icon: {
            type: 'string',
          },
          rating_order: {
            type: 'integer',
          },
          rating_value: {
            type: 'integer',
          },
          rating_type: {
            type: 'integer',
          },
        },
        required: [
          'rating_label',
          'rating_order',
          'rating_value',
          'rating_type',
        ],
      }),
      responses: SPathUtil.refResponse(
        '200',
        new RatingElement(),
        false,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class NewRatingAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('POST', '/rating', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ req, res, data }: XActionEvent): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();

      try {
        const el = await db.ratingEl.createObject(new RatingElement(req.body));
        res.status(201);
        res.send(el);
      } catch (e) {
        res.sendStatus(400);

        return;
      }

      return;
    }

    res.sendStatus(403);
  }
}
