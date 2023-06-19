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
      responses: SPathUtil.refResponse(
        '200',
        SPathUtil.schemaPath('MLabel'),
        true,
        '400',
        '404',
        '500'
      ),
    },
  },
})
export default class MovieLabelAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/movie/label/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null
  ): Promise<void> {
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

      const labels = await Promise.all(
        map.map(async (m) => ({
          label: await db.label.getObjById(m.label),
          map: m.e_id,
        }))
      );

      res.status(200).send(labels);
      return;
    }

    res.sendStatus(403);
  }
}
