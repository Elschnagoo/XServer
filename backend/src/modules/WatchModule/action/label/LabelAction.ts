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
import Label from '../../database/entities/Label';

@SPath({
  '/label': {
    get: {
      tags: ['Watch'],
      operationId: 'getLabels',
      summary: 'Get all label',
      responses: SPathUtil.refResponse(
        '200',
        new Label(),
        true,
        '400',
        '404',
        '500'
      ),
    },
  },
})
export default class LabelAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/label', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null
  ): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();

      res.status(200).send(
        await db.label.getObjList({
          order: [
            { key: 'label_order', order: 'ASC' },
            {
              key: 'label_name',
              order: 'ASC',
            },
          ],
        })
      );
      return;
    }

    res.sendStatus(403);
  }
}
