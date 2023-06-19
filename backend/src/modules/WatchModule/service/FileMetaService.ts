import {
  BaseLoopService,
  IBaseKernelModule,
  IKernel,
} from '@grandlinex/kernel';
import { WatchDB } from '../database';
import WatchClient from '../client/WatchClient';

export default class FileMetaService extends BaseLoopService<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(mod: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>) {
    super('file-meta-service', 30000, mod);
  }

  async loop(): Promise<void> {
    const db = this.getModule().getDb();
    const client = this.getModule().getClient();
    let els = await db.getFileMetaQ(10);

    while (els.length > 0) {
      for (const el of els) {
        try {
          this.debug(`Extract: ${el.file_path}`);
          const meta = await client.inspectFile(el.file_path);

          if (!meta) {
            this.error(`Could not get meta for ${el.file_path}`);
          }

          await db.file.updateObject(el.e_id, {
            synced: true,
            file_meta: meta,
          });
        } catch (e) {
          this.error(`Could not get meta [Exception] for ${el.file_path}`);
          this.error(e);
          await db.file.updateObject(el.e_id, { synced: true });
        }
      }
      els = await db.getFileMetaQ(10);
    }
    await this.next();
  }
}
