import { IBaseKernelModule, IKernel, ILogChannel } from '@grandlinex/kernel';
import Library from '../../database/entities/Library';
import { Scanner } from '../../lib';
import { WatchDB } from '../../database';
import LibPath from '../../database/entities/LibPath';
import WatchClient from '../../client/WatchClient';

export default abstract class BaseScanner implements Scanner {
  mod: IBaseKernelModule<IKernel, WatchDB, WatchClient>;

  db: WatchDB;

  client: WatchClient;

  chanel: ILogChannel;

  constructor(mod: IBaseKernelModule<IKernel, WatchDB>, log?: ILogChannel) {
    this.mod = mod;
    this.db = mod.getDb();
    this.client = mod.getClient();
    this.chanel = log || mod;
  }

  abstract scanFolder(lib: Library, path: LibPath): Promise<void>;
  abstract clean(lib: Library): Promise<void>;
  async scan(lib: Library): Promise<void> {
    const folder = await this.mod
      .getDb()
      .path.getObjList({ search: { lib: lib.e_id } });
    for (const f of folder) {
      await this.scanFolder(lib, f);
    }
  }
}
