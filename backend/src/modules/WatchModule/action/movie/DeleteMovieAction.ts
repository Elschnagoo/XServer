import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import WatchClient from '../../client/WatchClient';

@SPath({
  '/movie/e/{id}': {
    delete: {
      tags: ['Watch'],
      operationId: 'deleteMovie',
      summary: 'Delete Movie from Lib and disc',
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
      responses: SPathUtil.defaultResponse('200', '400', '404', '500'),
    },
  },
})
export default class DeleteMovieAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('DELETE', '/movie/e/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      if (!req.params.id) {
        res.sendStatus(400);
        return;
      }
      const db = this.getModule().getDb();
      const mov = await db.movieLib.getObjById(req.params.id);
      if (!mov) {
        res.sendStatus(404);
        return;
      }
      const file = await db.file.getObjById(mov.lib_file);
      if (!file) {
        res.sendStatus(500);
        return;
      }
      await this.getModule().getClient().deleteMovie(mov, file);
      res.sendStatus(200);
      return;
    }

    res.sendStatus(403);
  }
}
