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

@SPath({
  '/movie/{id}': {
    patch: {
      tags: ['Watch'],
      operationId: 'updateMovie',
      summary: 'Update Movie data',
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
          rating: {
            type: 'integer',
          },
          movie_name: {
            type: 'string',
          },
          movie_description: {
            type: 'string',
          },
          movie_url: {
            type: 'string',
          },
        },
      }),
      responses: SPathUtil.refResponse(
        '200',
        new MovieLib(),
        false,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class UpdateMovieAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('PATCH', '/movie/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req }: XActionEvent): Promise<void> {
    const { body } = req;
    const { rating, movie_name, movie_description, movie_url } = body;
    const ratingValid =
      rating === undefined ||
      (typeof rating === 'number' && rating >= -1 && rating <= 5);
    const movieNameValid =
      !movie_name || (typeof movie_name === 'string' && movie_name.length > 0);
    const movieDescriptionValid =
      !movie_description ||
      (typeof movie_description === 'string' && movie_description.length > 0);
    const noBody =
      rating === undefined &&
      !movie_name &&
      !movie_description &&
      movie_url === undefined;
    if (noBody || !(ratingValid && movieNameValid && movieDescriptionValid)) {
      res.sendStatus(400);
      return;
    }
    const db = this.getModule().getDb();
    const el = await db.movieLib.getObjById(req.params.id);
    if (!el) {
      res.sendStatus(404);
      return;
    }
    const changeRecord: Record<string, any> = {};
    if (rating && ratingValid) {
      if (rating === -1) {
        changeRecord.rating = null;
      } else {
        changeRecord.rating = rating;
      }
    }
    if (movie_name && movieNameValid) {
      changeRecord.movie_name = movie_name;
    }
    if (movie_description && movieDescriptionValid) {
      changeRecord.movie_description = movie_description;
    }
    if (typeof movie_url === 'string' || movie_url === null) {
      changeRecord.movie_url = movie_url;
    }
    const dx = await db.movieLib.updateObject(req.params.id, changeRecord);
    if (dx) {
      const newEl = await db.movieLib.getObjById(req.params.id);
      res.status(200).send(newEl);
    } else {
      res.sendStatus(500);
    }
  }
}
