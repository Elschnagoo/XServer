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
import LabelMap from '../../database/map/LabelMap';

@SPath({
  '/movie/label': {
    post: {
      tags: ['Watch'],
      operationId: 'bindLabel',
      summary: 'Bind label to movie',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          label: {
            type: 'string',
          },
          mov_lib: {
            type: 'string',
          },
        },
        required: ['label', 'mov_lib'],
      }),
      responses: SPathUtil.defaultResponse('201', '400', '404', '409', '500'),
    },
  },
})
export default class BindLabelAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('POST', '/movie/label', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null,
  ): Promise<void> {
    if (data) {
      const { label, mov_lib } = req.body;
      if (
        !label ||
        !mov_lib ||
        typeof label !== 'string' ||
        typeof mov_lib !== 'string'
      ) {
        res.sendStatus(400);
        return;
      }
      const db = this.getModule().getDb();
      const l = await db.label.getObjById(label);
      if (!l) {
        res.sendStatus(404);
        return;
      }
      const m = await db.movieLib.getObjById(mov_lib);
      if (!m) {
        res.sendStatus(404);
        return;
      }
      const exist = await db.labelMap.findObj({
        label,
        mov_lib,
      });
      if (exist) {
        res.sendStatus(409);
        return;
      }
      await db.labelMap.createObject(
        new LabelMap({
          label,
          mov_lib,
        }),
      );

      res.sendStatus(201);
      return;
    }

    res.sendStatus(403);
  }
}
