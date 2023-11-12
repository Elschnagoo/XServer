import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import LibFile from '../../database/entities/LibFile';

@SPath({
  '/movie/version/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getMovieVersion',
      summary: 'Get Movies Versions',
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
        new LibFile(),
        false,
        '400',
        '500',
      ),
    },
  },
})
export default class MovieVersionAction extends BaseApiAction<
  IKernel,
  WatchDB
> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/movie/version/:id', module, module.getKernel().getModule());
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

      const file = await db.file.getObjById(movie.lib_file);
      if (file) {
        file.file_path = '<hidden>';
        if (file.file_meta) {
          file.file_meta.format.filename = '<hidden>';
          res.status(200).send(file);
          return;
        }
      }
      res.sendStatus(500);

      return;
    }

    res.sendStatus(403);
  }
}
