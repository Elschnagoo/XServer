import {
  BaseLoopService,
  IBaseKernelModule,
  IKernel,
} from '@grandlinex/kernel';
import * as fs from 'fs';
import Path from 'path';
import { WatchDB } from '../database';
import WatchClient from '../client/WatchClient';

export default class ThumbService extends BaseLoopService<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(mod: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>) {
    super('thumb-service', 30000, mod);
  }

  async loop(): Promise<void> {
    const db = this.getModule().getDb();
    const client = this.getModule().getClient();
    let els = await db.getThumbMetaQ();
    const media = this.getKernel().getConfigStore().get('MEDIA_PATH')!;
    while (els.length > 0) {
      for (const el of els) {
        this.debug(`Thumbail: ${el.movie_name}`);

        try {
          const mediaPath = Path.join(media, el.lib, el.e_id);

          await fs.promises.mkdir(mediaPath, { recursive: true });

          const file = await db.file.getObjById(el.lib_file);

          if (file) {
            if (
              !(await client.makeThumbnail(
                file.file_path,
                mediaPath,
                file.duration,
              ))
            ) {
              this.error(`Error Make Thumbnails ${el.e_id}`);
            }
          } else {
            this.error(`No file found for ${el.e_id}`);
          }
        } catch (e) {
          this.error(`Error: ${el.movie_name}`);
          this.error(e);
        }

        await db.movieLib.updateObject(el.e_id, {
          synced: true,
        });
      }
      els = await db.getThumbMetaQ();
    }
    await this.next();
  }
}
