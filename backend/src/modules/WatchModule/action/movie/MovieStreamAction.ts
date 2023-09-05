import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  JwtToken,
  XRequest,
  XResponse,
} from '@grandlinex/kernel';

import * as fs from 'fs';
import { SPath } from '@grandlinex/swagger-mate';
import { WatchDB } from '../../database';
import Converter from '../../utils/Converter';

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

  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/movie/stream/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
    this.mediaPath = module.getKernel().getConfigStore().get('MEDIA_PATH')!;
    this.converter = new Converter(this.getKernel());
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null,
  ): Promise<void> {
    if (data) {
      const { id } = req.params;
      const { profile } = req.query;
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
