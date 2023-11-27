import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  XActionEvent,
} from '@grandlinex/kernel';

import * as fs from 'fs';

import { WatchDB } from '../../database';
import Converter from '../../utils/Converter';
import CoreTimeCache from '../../class/CoreTimeCache';

@SPath({
  '/movie/stream/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getMoviesStream',
      summary: 'Get Movie stream',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'profile',
          required: false,
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'trace',
          required: false,
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        200: {
          description: 'ok',
          content: {
            // "image/jpeg"
          },
        },
      },
    },
  },
})
export default class MovieStreamAction extends BaseApiAction<IKernel, WatchDB> {
  mediaPath: string;

  converter: Converter;

  traceCache: CoreTimeCache<string>;

  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/movie/stream/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
    this.mediaPath = module.getKernel().getConfigStore().get('MEDIA_PATH')!;
    this.converter = new Converter(this.getKernel());
    this.traceCache = new CoreTimeCache<string>(
      'stream-trace',
      this.getModule(),
    );
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    this.log(req.headers);

    if (data) {
      const { id } = req.params;
      const { profile, trace } = req.query;
      if (!id || (profile && typeof profile !== 'string')) {
        res.sendStatus(400);
        return;
      }

      const db = this.getModule().getDb();
      // Fined Video
      const dat = await db.movieLib.getObjById(req.params.id);

      if (dat) {
        const file = await db.file.getObjById(dat.lib_file);

        if (file && fs.existsSync(file.file_path)) {
          // HAS TRACE IN PATH
          if (trace && typeof trace === 'string') {
            const tr = this.traceCache.get(dat.e_id);
            // TRACE NOT MATCH
            if (tr !== trace) {
              this.traceCache.set(dat.e_id, trace, 1000 * 60 * 30);

              await db.movieLib.updateObject(dat.e_id, {
                played_count: (dat.played_count ?? 0) + 1,
                last_played: new Date(),
              });
            } else {
              // TRACE MATCH
              this.traceCache.extend(dat.e_id, 1000 * 60 * 5);
            }
          } else {
            // HAS NO TRACE IN PATH
            await db.movieLib.updateObject(dat.e_id, {
              played_count: (dat.played_count ?? 0) + 1,
              last_played: new Date(),
            });
          }

          this.converter.stream(file, res, profile);
          return;
        }
      }
      res.sendStatus(404);
      return;
    }

    res.sendStatus(403);
  }
}
