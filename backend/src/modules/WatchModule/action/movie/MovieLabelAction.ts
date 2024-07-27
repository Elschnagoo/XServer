import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';

@SPath({
  '/movie/label/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getMoviesLabel',
      summary: 'Get Movie label',
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
      responses: SPathUtil.jsonResponse(
        '200',
        {
          type: 'object',
          properties: {
            map: {
              type: 'string',
            },
          },
          required: ['map'],
        },
        true,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class MovieLabelAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/movie/label/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, data }: XActionEvent): Promise<void> {
    if (data) {
      const { id } = req.params;

      const db = this.getModule().getDb();
      const dat = await db.movieLib.getObjById(id);

      if (!dat) {
        res.sendStatus(404);
        return;
      }

      const map = await db.labelMap.getObjList({
        search: {
          mov_lib: dat.e_id,
        },
      });

      res.status(200).send(
        map.map((x) => ({
          map: x.label,
        })),
      );
      return;
    }

    res.sendStatus(403);
  }
}
