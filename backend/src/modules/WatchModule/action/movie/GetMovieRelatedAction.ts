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
import MovieLib from '../../database/entities/MovieLib';
import { isUUID } from '../../utils/Validation';

@SPath({
  '/movie/related/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getMovieRelated',
      summary: 'Get movie related content',
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
        new MovieLib(),
        true,
        '400',
        '500',
      ),
    },
  },
})
export default class GetMovieRelatedAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('GET', '/movie/related/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      if (!req.params.id || !isUUID(req.params.id)) {
        res.sendStatus(400);
        return;
      }
      const db = this.getModule().getDb();
      const [mov] = await db.execScripts([
        {
          exec: `SELECT lib.*
                    from watch.movie_lib as lib
                             join (SELECT SUM(1) as sum, mov_lib
                                   FROM (SELECT mov_lib
                                         from watch.label_map
                                         WHERE label in
                                               (SELECT DISTINCT label
                                                FROM watch.label_map
                                                WHERE mov_lib = $1)) as Q
                                   WHERE mov_lib != $2
                                   GROUP BY mov_lib
                                   ORDER BY sum DESC
                                   LIMIT 25) AS sel on lib.e_id = sel.mov_lib;`,
          param: [req.params.id, req.params.id],
        },
      ]);
      if (!mov) {
        res.sendStatus(404);
        return;
      }
      res.status(200).send(mov.rows);
      return;
    }

    res.sendStatus(403);
  }
}
