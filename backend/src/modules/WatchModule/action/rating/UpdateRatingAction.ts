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
  '/rating/{id}': {
    patch: {
      tags: ['Watch'],
      operationId: 'updateRating',
      summary: 'Update rating element',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
        },
      ],
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
export default class UpdateRatingAction extends BaseApiAction<
  IKernel,
  WatchDB
> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('PATCH', '/rating/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ req, res, data }: XActionEvent): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();

      const rel = await db.ratingEl.getObjById(req.params.id);
      if (!rel) {
        res.sendStatus(404);
        return;
      }

      try {
        const el = await db.ratingEl.updateObject(rel.e_id, req.body);
        if (el) {
          res.status(200);
          res.send(await db.ratingEl.getObjById(req.params.id));
          return;
        }
      } catch (e) {
        this.error(e);
      }
      res.sendStatus(400);
      return;
    }

    res.sendStatus(403);
  }
}
