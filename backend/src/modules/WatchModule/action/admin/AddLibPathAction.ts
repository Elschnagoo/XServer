import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import fs from 'fs';
import { WatchDB } from '../../database';
import ScannerQ from '../../database/queue/ScannerQ';
import { StateTypeQEnum } from '../../database/queue/StateTypeQ';
import LibPath from '../../database/entities/LibPath';

@SPath({
  '/lib/add': {
    post: {
      summary: 'Add lib path',
      tags: ['Watch'],
      operationId: 'addLibPath',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          path: {
            type: 'string',
          },
          download: {
            type: 'boolean',
          },
        },
        required: ['path'],
      }),
      responses: SPathUtil.defaultResponse('201', '403', '500'),
    },
  },
})
export default class AddLibPathAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('POST', '/lib/add', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req }: XActionEvent): Promise<void> {
    const { body } = req;
    const { path, download } = body;
    if (!path) {
      res.sendStatus(403);
      return;
    }
    const db = this.getModule().getDb();
    const lib = await db.lib.findObj({});
    if (!lib) {
      res.sendStatus(500);
      return;
    }
    if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
      res.sendStatus(500);
      return;
    }
    const exist = await db.path.findObj({ lib: lib.e_id, lib_path: path });
    if (exist) {
      res.sendStatus(409);
      return;
    }
    const libPath = new LibPath({
      download: download || false,
      lib: lib.e_id,
      lib_path: path,
    });

    try {
      await db.path.createObject(libPath);
      await db.scanQ.createObject(
        new ScannerQ({
          created: new Date(),
          error: null,
          lib: lib.e_id,
          state: StateTypeQEnum.PENDING,
        }),
      );
      res.sendStatus(201);
    } catch (err) {
      res.sendStatus(500);
    }
  }
}
