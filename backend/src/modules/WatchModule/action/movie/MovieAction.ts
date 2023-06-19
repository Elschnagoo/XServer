import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  JwtToken,
  XRequest,
  XResponse,
} from '@grandlinex/kernel';

import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { query } from 'express';
import { WatchDB } from '../../database';
import MovieLib from '../../database/entities/MovieLib';
import { isUUID } from '../../utils/Validation';

@SPath({
  '/movie': {
    get: {
      tags: ['Watch'],
      operationId: 'getMovies',
      summary: 'Get Movies',
      parameters: [
        {
          name: 'label',
          in: 'query',
          description: 'Label',
          required: false,
          schema: {
            type: 'string',
          },
        },
        {
          name: 'rating',
          in: 'query',
          description: 'Rating',
          required: false,
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
        '500'
      ),
    },
  },
})
export default class MovieAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/movie', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null
  ): Promise<void> {
    if (data) {
      const { rating, label } = req.query;

      let rat: number | undefined;
      try {
        rat =
          typeof rating === 'string'
            ? parseInt(rating as string, 10)
            : undefined;
      } catch (e) {
        this.error(e);
        res.sendStatus(400);
        return;
      }
      let lab: string[] | undefined;
      try {
        if (label) {
          if (typeof label !== 'string') {
            res.sendStatus(400);
            return;
          }
          lab = label.split(';');
          let valid = true;
          lab.forEach((cur) => {
            if (!isUUID(cur)) {
              valid = false;
            }
          });
          if (!valid) {
            res.sendStatus(400);
            return;
          }
        }
      } catch (e) {
        this.error(e);
        res.sendStatus(400);
        return;
      }

      const db = this.getModule().getDb();
      const dat = await db.searchQuery(rat, lab);

      res.status(200).send(dat);
      return;
    }

    res.sendStatus(403);
  }
}
