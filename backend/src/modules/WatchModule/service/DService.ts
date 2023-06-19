import {
  BaseLoopService,
  IBaseKernelModule,
  IKernel,
} from '@grandlinex/kernel';
import * as path from 'path';
import fs from 'fs';
import { StateTypeQEnum } from '../database/queue/StateTypeQ';
import { WatchDB } from '../database';
import DownloadQ from '../database/queue/DownloadQ';
import MovieScanner from '../class/scanner/MovieScanner';
import Downloader from '../../YTDL/class/Downloader';
import YTDLMod from '../../YTDL/YTDLMod';

export default class DService extends BaseLoopService<IKernel, WatchDB> {
  dPath: string;

  constructor(mod: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('down-service', 30000, mod);
    this.dPath = this.getConfigStore().get('DOWNLOAD_PATH')!;
  }

  async downloadFile(
    dw: DownloadQ,
    downloader: Downloader,
    scanner: MovieScanner
  ): Promise<boolean> {
    const db = this.getModule().getDb();
    const libPath = (await db.path.getObjById(dw.lib_path))!;
    const lib = (await db.lib.getObjById(libPath.lib))!;
    try {
      this.log(`Download: ${dw.download_path}`);
      const donwRes = await downloader.downloadResource(dw.download_path);
      if (donwRes) {
        for (const f of donwRes) {
          let nPath = path.join(libPath.lib_path, f.fileName);
          if (fs.existsSync(nPath)) {
            nPath = path.join(libPath.lib_path, `${Date.now()}-${f.fileName}`);
          }
          await fs.promises.cp(f.fullPath, nPath);
          await scanner.fileAdd(lib, libPath, nPath, f.fileName);
        }
        this.log(`Download: ${dw.download_path} complete`);
      }
      downloader.clearFolder();
      return !!donwRes;
    } catch (e) {
      this.error(e);
      return false;
    }
  }

  async loop(): Promise<void> {
    const db = this.getModule().getDb();
    const scanner = new MovieScanner(this.getModule(), this);
    const downloader = await this.getModule()
      .getBridgeModule<YTDLMod>('yt-dl')!
      .getClient()
      .getFileDownloader(this.dPath);

    if (downloader.checkEmptyFolder()) {
      downloader.clearFolder();
    }

    let items = await db.download.getObjList({
      search: { state: StateTypeQEnum.PENDING },
      limit: 2,
      order: [{ order: 'ASC', key: 'created' }],
    });

    while (items.length > 0) {
      for (const item of items) {
        if (!this.forceStop) {
          await db.download.updateObject(item.e_id, {
            state: StateTypeQEnum.RUNNING,
          });
          try {
            const r = await this.downloadFile(item, downloader, scanner);
            if (r) {
              await db.download.updateObject(item.e_id, {
                state: StateTypeQEnum.DONE,
              });
            } else {
              await db.download.updateObject(item.e_id, {
                state: StateTypeQEnum.ERROR,
              });
            }
          } catch (e: any) {
            this.error(e);
            await db.download.updateObject(item.e_id, {
              state: StateTypeQEnum.ERROR,
              error: {
                message: 'Service Exception',
                raw: e?.message,
              },
            });
          }
        }
      }

      items = await db.download.getObjList({
        search: { state: StateTypeQEnum.PENDING },
        limit: 2,
        order: [{ order: 'ASC', key: 'created' }],
      });
    }

    await this.next();
  }
}
