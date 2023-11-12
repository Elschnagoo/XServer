import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import MovieRating from '../../database/entities/MovieRating';
import WatchClient from '../../client/WatchClient';

@SPath({
  '/movie/rating/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getMovieRating',
      summary: 'Get Movie rating',
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
      responses: SPathUtil.refResponse(
        '200',
        new MovieRating(),
        true,
        '400',
        '500',
      ),
    },
  },
})
export default class GetMovieRatingAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('GET', '/movie/rating/:id', module, module.getKernel().getModule());
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

      const movie = await db.movieLib.getObjById(id);
      if (!movie) {
        res.sendStatus(404);
        return;
      }

      const rElement = await db.movRating.getObjList({
        search: {
          movie: movie.e_id,
        },
      });

      res.status(200);
      res.send(rElement);
      return;
    }

    res.sendStatus(403);
  }
}
