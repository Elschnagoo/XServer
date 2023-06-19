import {
  BaseLoopService,
  IBaseKernelModule,
  IKernel,
} from '@grandlinex/kernel';
import { StateTypeQEnum } from '../database/queue/StateTypeQ';
import { WatchDB } from '../database';
import MovieScanner from '../class/scanner/MovieScanner';
import { Scanner } from '../lib';
import { LibTypeEnum } from '../database/entities/LibType';

export default class QService extends BaseLoopService<IKernel, WatchDB> {
  constructor(mod: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('qservice', 30000, mod);
  }

  async loop(): Promise<void> {
    const db = this.getModule().getDb();
    let items = await db.scanQ.getObjList({
      search: { state: StateTypeQEnum.PENDING },
      limit: 4,
      order: [{ order: 'ASC', key: 'created' }],
    });
    while (items.length > 0) {
      for (const item of items) {
        if (!this.forceStop) {
          await db.scanQ.updateObject(item.e_id, {
            state: StateTypeQEnum.RUNNING,
          });
          try {
            const lib = await db.lib.getObjById(item.lib);
            let scanner: Scanner | null;
            if (!lib) {
              await db.scanQ.updateObject(item.e_id, {
                state: StateTypeQEnum.ERROR,
                error: {
                  message: 'NO LIB FOUND',
                },
              });
            } else {
              switch (lib.lib_type) {
                case LibTypeEnum.MOVIE:
                  scanner = new MovieScanner(this.getModule(), this);
                  break;
                default:
                  scanner = null;
                  break;
              }
              if (scanner) {
                this.debug(`clean ${lib.lib_type} ${lib.e_id}`);
                await scanner.clean(lib);
                this.debug(`scan ${lib.lib_type} ${lib.e_id}`);
                await scanner.scan(lib);
                await db.scanQ.updateObject(item.e_id, {
                  state: StateTypeQEnum.DONE,
                });
                this.debug(`DONE ${lib.lib_type} ${lib.e_id}`);
              } else {
                await db.scanQ.updateObject(item.e_id, {
                  state: StateTypeQEnum.ERROR,
                  error: {
                    message: 'NO SCANNER FOUND',
                  },
                });
              }
            }
          } catch (e: any) {
            this.error(e);
            await db.scanQ.updateObject(item.e_id, {
              state: StateTypeQEnum.ERROR,
              error: {
                message: 'Service Exception',
                raw: e?.message,
              },
            });
          }
        }
      }
      items = await db.scanQ.getObjList({
        search: { state: StateTypeQEnum.PENDING },
        limit: 4,
        order: [{ order: 'ASC', key: 'created' }],
      });
    }

    await this.next();
  }
}
