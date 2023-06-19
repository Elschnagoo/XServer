import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  JwtToken,
  XRequest,
  XResponse,
} from '@grandlinex/kernel';
import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { WatchDB } from '../../database';
import WatchClient from '../../client/WatchClient';
import MovieLib from '../../database/entities/MovieLib';
import { isUUID } from '../../utils/Validation';

@SPath({
  '/movie/e/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getMovie',
      summary: 'Get single Movie',
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
        false,
        '400',
        '500'
      ),
    },
  },
})
export default class GetMovieAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>
  ) {
    super('GET', '/movie/e/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null
  ): Promise<void> {
    if (data) {
      if (!req.params.id || !isUUID(req.params.id)) {
        res.sendStatus(400);
        return;
      }
      const db = this.getModule().getDb();
      const mov = await db.movieLib.getObjById(req.params.id);
      if (!mov) {
        res.sendStatus(404);
        return;
      }
      res.status(200).send(mov);
      return;
    }

    res.sendStatus(403);
  }
}
