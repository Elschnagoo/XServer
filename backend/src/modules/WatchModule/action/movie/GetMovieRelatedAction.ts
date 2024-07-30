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
import BrowserSupport from '../../lib/BrowserSupport';
import { ExtMovLib } from '../../database/WatchDB';

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

  async handler({ res, req, data, agent }: XActionEvent): Promise<void> {
    if (data) {
      if (!req.params.id || !isUUID(req.params.id)) {
        res.sendStatus(400);
        return;
      }
      const support = new BrowserSupport(agent);

      const db = this.getModule().getDb();
      const [mov] = await db.execScripts([
        {
          exec: `SELECT lib.*,file.duration,file.synced,file.file_meta
                    FROM watch.movie_lib AS lib
                             JOIN (SELECT SUM(1) AS sum, mov_lib
                                   FROM (SELECT mov_lib
                                         FROM watch.label_map
                                         WHERE label in
                                               (SELECT DISTINCT label
                                                FROM watch.label_map
                                                WHERE mov_lib = $1)) as Q
                                   WHERE mov_lib != $2
                                   GROUP BY mov_lib
                                   ORDER BY sum DESC
                                   LIMIT 25) AS sel ON lib.e_id = sel.mov_lib,
                   watch.lib_file AS file 
                   WHERE disabled = false
                   AND lib.lib_file = file.e_id;`,
          param: [req.params.id, req.params.id],
        },
      ]);
      if (!mov) {
        res.sendStatus(404);
        return;
      }
      res.status(200).send(
        mov.rows.map((cur: ExtMovLib) => {
          const v = cur.file_meta?.streams.find(
            (e) => e.codec_type === 'video',
          );
          const a = cur.file_meta?.streams.find(
            (e) => e.codec_type === 'audio',
          );
          return {
            ...cur,
            size: cur.file_meta?.format.size,
            video: {
              code: v?.codec_name || 'none',
              supported: support.canPlayVideoCodec(v?.codec_name),
              quality: v?.height,
            },
            audio: {
              code: a?.codec_name || 'none',
              supported: support.canPlayAudioCodec(a?.codec_name),
            },
            file_meta: undefined,
          };
        }),
      );
      return;
    }

    res.sendStatus(403);
  }
}
