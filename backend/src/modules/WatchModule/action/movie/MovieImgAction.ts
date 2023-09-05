import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  JwtToken,
  XRequest,
  XResponse,
} from '@grandlinex/kernel';

import * as fs from 'fs';
import * as path from 'path';
import { SPath } from '@grandlinex/swagger-mate';
import { WatchDB } from '../../database';

const thumps = ['tn_1', 'tn_2', 'tn_3', 'tn_4', 'tn_5'];

@SPath({
  '/movie/img/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getMoviesPoster',
      summary: 'Get Movie poster',
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
          name: 'type',
          required: true,
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
export default class MovieImgAction extends BaseApiAction<IKernel, WatchDB> {
  mediaPath: string;

  resPath: string;

  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/movie/img/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
    this.mediaPath = module.getKernel().getConfigStore().get('MEDIA_PATH')!;
    this.resPath = module.getKernel().getConfigStore().get('RES_PATH')!;
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null,
  ): Promise<void> {
    if (data) {
      const { id } = req.params;
      const { type } = req.query;
      if (!type || !id || typeof type !== 'string' || !thumps.includes(type)) {
        res.sendStatus(400);
        return;
      }
      const db = this.getModule().getDb();
      const dat = await db.movieLib.getObjById(req.params.id);

      if (dat) {
        const imgPath = path.join(
          this.mediaPath,
          dat.lib,
          dat.e_id,
          `${type}.webp`,
        );
        if (fs.existsSync(imgPath)) {
          res.status(200).sendFile(imgPath);
          return;
        }
        if (type === 'poster') {
          res
            .status(200)
            .sendFile(path.join(this.resPath, 'fallback', 'poster.jpg'));
          return;
        }
        if (thumps.includes(type)) {
          res
            .status(200)
            .sendFile(path.join(this.resPath, 'fallback', 'backdrop.png'));
          return;
        }
      }
      res.sendStatus(404);
      return;
    }

    res.sendStatus(403);
  }
}
