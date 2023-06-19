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
import DownloadQ from '../../database/queue/DownloadQ';
import { StateTypeQEnum } from '../../database/queue/StateTypeQ';
import YTDLMod from '../../../YTDL/YTDLMod';

@SPath({
  '/download': {
    post: {
      tags: ['Watch'],
      operationId: 'downloadMedia',
      summary: 'Download Media',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          url: {
            type: 'string',
          },
        },
        required: ['url'],
      }),
      responses: SPathUtil.defaultResponse('201', '400', '404', '500'),
    },
  },
})
export default class DownloadAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('POST', '/download', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null
  ): Promise<void> {
    const { body } = req;
    const { url } = body;
    if (!url) {
      res.sendStatus(400);
      return;
    }
    const db = this.getModule().getDb();
    const lPath = await db.path.findObj({ download: true });
    if (!lPath) {
      res.sendStatus(500);
      return;
    }
    const existing = await db.download.findObj({ download_path: url });
    if (existing) {
      res.sendStatus(409);
      return;
    }

    const mod = this.getModule().getBridgeModule<YTDLMod>('yt-dl')!;

    const ytClient = mod.getClient();
    const info = await ytClient.getFullResourceInfo(url);
    if (!info || info.length === 0) {
      res.sendStatus(404);
      return;
    }

    await db.download.createObject(
      new DownloadQ({
        created: new Date(),
        download_path: url,
        error: null,
        lib_path: lPath.e_id,
        state: StateTypeQEnum.PENDING,
      })
    );

    res.sendStatus(201);
  }
}
