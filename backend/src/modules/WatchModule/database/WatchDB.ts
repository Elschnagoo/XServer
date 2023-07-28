import {
  CoreEntityWrapper,
  IBaseKernelModule,
  RawQuery,
} from '@grandlinex/kernel';

import PGCon from '@grandlinex/bundle-postgresql';
import LibType, { LibTypeEnum } from './entities/LibType';
import Library from './entities/Library';
import LibPath from './entities/LibPath';
import LibFile from './entities/LibFile';
import StateTypeQ, { StateTypeQEnum } from './queue/StateTypeQ';
import ScannerQ from './queue/ScannerQ';
import MovieLib from './entities/MovieLib';
import Patch001 from './patch/Patch001';
import Label from './entities/Label';
import LabelMap from './map/LabelMap';
import Patch002 from './patch/Patch002';
import DownloadQ from './queue/DownloadQ';
import Patch003 from './patch/Patch003';

export default class WatchDB extends PGCon {
  types: CoreEntityWrapper<LibType>;

  states: CoreEntityWrapper<StateTypeQ>;

  lib: CoreEntityWrapper<Library>;

  path: CoreEntityWrapper<LibPath>;

  file: CoreEntityWrapper<LibFile>;

  scanQ: CoreEntityWrapper<ScannerQ>;

  download: CoreEntityWrapper<DownloadQ>;

  movieLib: CoreEntityWrapper<MovieLib>;

  label: CoreEntityWrapper<Label>;

  labelMap: CoreEntityWrapper<LabelMap>;

  constructor(mod: IBaseKernelModule<any, any, any, any, any>) {
    super(mod, '3');
    this.types = this.registerEntity(new LibType());
    this.states = this.registerEntity(new StateTypeQ());
    this.lib = this.registerEntity(new Library());
    this.path = this.registerEntity(new LibPath());
    this.file = this.registerEntity(new LibFile());

    this.movieLib = this.registerEntity(new MovieLib());

    this.scanQ = this.registerEntity(new ScannerQ());
    this.download = this.registerEntity(new DownloadQ());
    this.label = this.registerEntity(new Label());
    this.labelMap = this.registerEntity(new LabelMap());
    this.setUpdateChain(
      new Patch001(this),
      new Patch002(this),
      new Patch003(this),
    );
  }

  async searchQuery(
    min?: number,
    max?: number,
    label?: string[],
  ): Promise<MovieLib[]> {
    const param: any[] = [];
    let paramCounter = 1;
    const filter = [];
    if (min !== undefined) {
      filter.push(`AND rating >= $${paramCounter}`);
      param.push(min);
      paramCounter += 1;
    }
    if (max !== undefined) {
      if (max === 0) {
        filter.push(`AND rating is null`);
      } else {
        filter.push(`AND rating <= $${paramCounter}`);
        param.push(max);
        paramCounter += 1;
      }
    }
    if (label) {
      const idd = label.map((cur) => `'${cur}'`).join(',');
      filter.push(`AND lib.e_id in (SELECT mov_lib
                                FROM (SELECT count(1) as count, mov_lib
                                      FROM watch.label_map
                                      WHERE label in (${idd})
                                      GROUP BY mov_lib) as cml
                                      WHERE count = $${paramCounter})`);
      param.push(label.length);
      paramCounter += 1;
    }

    const query: RawQuery = {
      exec: `
          SELECT lib.*,file.duration
          FROM ${this.schemaName}.movie_lib as lib,
               ${this.schemaName}.lib_file as file
          WHERE disabled = false
          AND   lib.lib_file = file.e_id
          ${filter.join('\n')}
          ORDER BY created DESC;
        `,
      param,
    };

    const [res] = await this.execScripts([query]);
    return res?.rows || [];
  }

  async initNewDB(): Promise<void> {
    for (const el in LibTypeEnum) {
      if (el) {
        await this.types.createObject(new LibType(el as LibTypeEnum));
      }
    }
    for (const el in StateTypeQEnum) {
      if (el) {
        await this.states.createObject(new StateTypeQ(el as StateTypeQEnum));
      }
    }
    await this.lib.createObject(
      new Library({ lib_name: 'default_lib', lib_type: LibTypeEnum.MOVIE }),
    );
  }

  async getFileMetaQ(limit = 50): Promise<LibFile[]> {
    const [res] = await this.execScripts([
      {
        exec: `SELECT * FROM ${this.schemaName}.lib_file WHERE synced = false LIMIT $1 ;`,
        param: [limit],
      },
    ]);
    return res?.rows || [];
  }

  async getThumbMetaQ(limit = 50): Promise<MovieLib[]> {
    const [res] = await this.execScripts([
      {
        exec: `SELECT *
               FROM ${this.schemaName}.movie_lib
               WHERE synced=false
                 AND lib_file in (
                 SELECT e_id
                 FROM (
                        SELECT *,file_meta::text as mtex
                        FROM ${this.schemaName}.lib_file
                        WHERE synced = true
                      ) AS lb
                 WHERE mtex !='null'
               ) LIMIT $1 ;`,
        param: [limit],
      },
    ]);
    return res?.rows || [];
  }
}
