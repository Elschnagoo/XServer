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
import RatingElement from '../../database/entities/RatingElement';

@SPath({
  '/rating': {
    get: {
      tags: ['Watch'],
      operationId: 'getRating',
      summary: 'Get all rating elements',
      responses: SPathUtil.refResponse(
        '200',
        new RatingElement(),
        true,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class RatingAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/rating', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null,
  ): Promise<void> {
    if (data) {
      const db = this.getModule().getDb();

      res.status(200).send(
        await db.ratingEl.getObjList({
          order: [
            { key: 'rating_order', order: 'ASC' },
            { key: 'rating_label', order: 'ASC' },
          ],
        }),
      );
      return;
    }

    res.sendStatus(403);
  }
}
