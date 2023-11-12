import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import MovieLib from '../../database/entities/MovieLib';
import MovieRating from '../../database/entities/MovieRating';
import WatchClient from '../../client/WatchClient';

@SPath({
  '/movie/rating/{id}': {
    post: {
      tags: ['Watch'],
      operationId: 'setMovieRating',
      summary: 'Set Movie rating',
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
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          element: {
            type: 'string',
          },
          rating: {
            type: 'integer',
          },
        },
        required: ['element', 'rating'],
      }),
      responses: SPathUtil.refResponse(
        '200',
        new MovieLib(),
        false,
        '400',
        '500',
      ),
    },
  },
})
export default class SetMovieRatingAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('POST', '/movie/rating/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const { id } = req.params;

      if (!id) {
        res.sendStatus(400);
        return;
      }

      const db = this.getModule().getDb();
      const client = this.getModule().getClient();

      const movie = await db.movieLib.getObjById(id);
      if (!movie) {
        res.sendStatus(404);
        return;
      }
      const { element, rating } = req.body;

      const rElement = await db.ratingEl.getObjById(element);

      if (!rElement) {
        res.sendStatus(404);
        return;
      }

      if (typeof element !== 'string' || typeof rating !== 'number') {
        res.sendStatus(400);
        return;
      }

      switch (rElement.rating_type) {
        case 'STAR':
          if (rating < -1 || rating > 5) {
            res.sendStatus(400);
            return;
          }
          break;
        case 'BOOL':
          if (rating < -1 || rating > 1) {
            res.sendStatus(400);
            return;
          }
          break;
        default:
          res.sendStatus(400);
          return;
      }

      const el = await db.movRating.findObj({
        movie: id,
        element,
      });

      if (el) {
        await db.movRating.updateObject(el.e_id, {
          rating_value: rating,
        });
      } else {
        await db.movRating.createObject(
          new MovieRating({
            rating_value: rating,
            element,
            movie: id,
          }),
        );
      }

      res.status(200);
      res.send(await client.updateRating(movie));
      return;
    }

    res.sendStatus(403);
  }
}
