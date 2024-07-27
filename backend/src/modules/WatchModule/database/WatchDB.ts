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
import Label from './entities/Label';
import LabelMap from './map/LabelMap';
import DownloadQ from './queue/DownloadQ';
import RatingElement from './entities/RatingElement';
import * as Patch from './patch';
import MovieRating from './entities/MovieRating';
import LabelAlias from './entities/LabelAlias';
import { ProbeInfo } from '../lib/MediaHandlerTypes';

export enum SearchOrder {
  DATE_ASC = 'date_asc',
  DATE_DSC = 'date_dsc',
  RATING_ASC = 'rating_asc',
  RATING_DSC = 'rating_dsc',
  DURATION_ASC = 'duration_asc',
  DURATION_DSC = 'duration_dsc',
  NAME_ASC = 'name_asc',
  NAME_DSC = 'name_dsc',
  LAST_PLAYED_ASC = 'last_played_asc',
  LAST_PLAYED_DSC = 'last_played_dsc',
  PLAYS_ASC = 'plays_asc',
  PLAYS_DSC = 'plays_dsc',
  PLAYS_NO = 'plays_no',
  QUALITY_ASC = 'quality_asc',
  QUALITY_DSC = 'quality_dsc',
  SHUFFLE = 'shuffle',
}

export type ExtMovLib = MovieLib & {
  duration?: number;
  quality?: number;
  synced: boolean;
  file_meta: ProbeInfo | null;
};

export type SearchProps = {
  ratingMin?: number;
  ratingMax?: number;
  needLabel?: string[];
  notLabel?: string[];
  optLabel?: string[];
  page?: number;
  sortOrder?: string;
  hasLink?: boolean;
  isSynced?: boolean;
  title?: string;
  duration?: string;
};

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

  labelAlias: CoreEntityWrapper<LabelAlias>;

  labelMap: CoreEntityWrapper<LabelMap>;

  ratingEl: CoreEntityWrapper<RatingElement>;

  movRating: CoreEntityWrapper<MovieRating>;

  constructor(mod: IBaseKernelModule<any, any, any, any, any>) {
    super(mod, '10');
    this.types = this.registerEntity(new LibType());
    this.states = this.registerEntity(new StateTypeQ());
    this.lib = this.registerEntity(new Library());
    this.path = this.registerEntity(new LibPath());
    this.file = this.registerEntity(new LibFile());

    this.movieLib = this.registerEntity(new MovieLib());

    this.scanQ = this.registerEntity(new ScannerQ());
    this.download = this.registerEntity(new DownloadQ());
    this.label = this.registerEntity(new Label());
    this.labelAlias = this.registerEntity(new LabelAlias());
    this.labelMap = this.registerEntity(new LabelMap());
    this.ratingEl = this.registerEntity(new RatingElement());
    this.movRating = this.registerEntity(new MovieRating());

    this.setUpdateChain(
      new Patch.Patch001(this),
      new Patch.Patch002(this),
      new Patch.Patch003(this),
      new Patch.Patch004(this),
      new Patch.Patch005(this),
      new Patch.Patch006(this),
      new Patch.Patch007(this),
      new Patch.Patch008(this),
      new Patch.Patch009(this),
      new Patch.Patch010(this),
    );
  }

  async searchQuery(ops: SearchProps): Promise<{
    data: ExtMovLib[];
    count: string;
  }> {
    const {
      ratingMin,
      ratingMax,
      needLabel,
      notLabel,
      optLabel,
      page,
      title,
      isSynced,
      hasLink,
      duration,
      sortOrder,
    } = ops;
    const filter: string[] = [];
    const param: (string | number | boolean)[] = [];
    let paramCounter = 1;

    let orderBy = 'ORDER BY lib.created DESC';

    switch (sortOrder as SearchOrder | undefined) {
      case SearchOrder.DATE_DSC:
        orderBy = `ORDER BY lib.created DESC`;
        break;
      case SearchOrder.DATE_ASC:
        orderBy = `ORDER BY lib.created ASC`;
        break;
      case SearchOrder.RATING_DSC:
        orderBy = `ORDER BY lib.rating DESC`;
        break;
      case SearchOrder.RATING_ASC:
        orderBy = `ORDER BY lib.rating ASC`;
        break;
      case SearchOrder.DURATION_DSC:
        orderBy = `ORDER BY file.duration DESC`;
        filter.push(`AND file.duration IS NOT NULL`);
        break;
      case SearchOrder.DURATION_ASC:
        orderBy = `ORDER BY file.duration ASC`;
        filter.push(`AND file.duration IS NOT NULL`);
        break;
      case SearchOrder.NAME_DSC:
        orderBy = `ORDER BY lib.movie_name DESC`;
        break;
      case SearchOrder.NAME_ASC:
        orderBy = `ORDER BY lib.movie_name ASC`;
        break;
      case SearchOrder.PLAYS_DSC:
        orderBy = `ORDER BY lib.played_count DESC`;
        filter.push(`AND lib.played_count IS NOT NULL`);
        break;
      case SearchOrder.PLAYS_ASC:
        orderBy = `ORDER BY lib.played_count ASC`;
        filter.push(`AND lib.played_count IS NOT NULL`);
        break;
      case SearchOrder.PLAYS_NO:
        filter.push(`AND lib.played_count IS NULL OR lib.played_count = 0`);
        break;
      case SearchOrder.LAST_PLAYED_DSC:
        orderBy = `ORDER BY lib.last_played DESC`;
        filter.push(`AND lib.last_played IS NOT NULL`);
        break;
      case SearchOrder.LAST_PLAYED_ASC:
        orderBy = `ORDER BY lib.last_played ASC`;
        filter.push(`AND lib.last_played IS NOT NULL`);
        break;
      case SearchOrder.QUALITY_DSC:
        orderBy = `ORDER BY file.quality DESC, lib.created DESC`;
        filter.push(`AND file.quality IS NOT NULL`);
        break;
      case SearchOrder.QUALITY_ASC:
        orderBy = `ORDER BY file.quality ASC, lib.created DESC`;
        filter.push(`AND file.quality IS NOT NULL`);
        break;
      case SearchOrder.SHUFFLE:
        orderBy = `ORDER BY random()`;
        break;
      default:
    }

    switch (duration) {
      case 'short':
        filter.push(`AND file.duration IS NOT null AND file.duration < 600`);
        break;
      case 'medium':
        filter.push(
          `AND file.duration IS NOT null AND file.duration > 600 AND file.duration < 1800 `,
        );
        break;
      case 'long':
        filter.push(`AND file.duration IS NOT null AND file.duration > 1800 `);
        break;
      default:
    }
    if (title !== undefined) {
      filter.push(
        `AND (LOWER(movie_name) like '%' || $${paramCounter++} || '%' OR lib.e_id = $${paramCounter++} ) `,
      );
      param.push(title.toLowerCase(), title);
    }
    if (isSynced !== undefined) {
      filter.push(`AND lib.synced = $${paramCounter++}`);
      param.push(isSynced);
    }
    if (hasLink !== undefined) {
      filter.push(`AND lib.movie_url IS${hasLink ? ' NOT' : ''} NULL`);
    }
    if (ratingMin !== undefined) {
      filter.push(`AND rating >= $${paramCounter++}`);
      param.push(ratingMin);
    }
    if (ratingMax !== undefined) {
      if (ratingMax === 0) {
        filter.push(`AND rating is null`);
      } else {
        filter.push(`AND rating <= $${paramCounter++}`);
        param.push(ratingMax);
      }
    }
    if (needLabel) {
      const idd = needLabel.map((cur) => `'${cur}'`).join(',');
      filter.push(`AND lib.e_id in (SELECT mov_lib
                                    FROM (SELECT count(1) as count, mov_lib
                                          FROM watch.label_map
                                          WHERE label in (${idd})
                                          GROUP BY mov_lib) as cml
                                    WHERE count = $${paramCounter++})`);
      param.push(needLabel.length);
    }
    if (optLabel) {
      const idd = optLabel.map((cur) => `'${cur}'`).join(',');
      filter.push(`AND lib.e_id in (SELECT mov_lib
                                    FROM (SELECT count(1) as count, mov_lib
                                          FROM watch.label_map
                                          WHERE label in (${idd})
                                          GROUP BY mov_lib) as cml
                                    WHERE count > 0)`);
    }
    if (notLabel) {
      const idd = notLabel.map((cur) => `'${cur}'`).join(',');
      filter.push(`AND lib.e_id not in (SELECT mov_lib
                                        FROM (SELECT count(1) as count, mov_lib
                                              FROM watch.label_map
                                              WHERE label in (${idd})
                                              GROUP BY mov_lib) as cml
                                        WHERE count >0)`);
    }

    const qPram = [...param];
    if (page) {
      qPram.push(25, page * 25);
    } else {
      qPram.push(25, 0);
    }
    const query: RawQuery = {
      exec: `
          SELECT lib.*,file.duration,file.synced,file.file_meta,file.quality
          FROM ${this.schemaName}.movie_lib as lib,
               ${this.schemaName}.lib_file as file
          WHERE disabled = false
          AND lib.lib_file = file.e_id
          ${filter.join('\n')}
          ${orderBy}
          LIMIT $${paramCounter++} OFFSET $${paramCounter++};
        `,
      param: qPram,
    };

    const queryC: RawQuery = {
      exec: `
          SELECT count(1) as count
          FROM ${this.schemaName}.movie_lib as lib,
               ${this.schemaName}.lib_file as file
          WHERE disabled = false
          AND lib.lib_file = file.e_id
          ${filter.join('\n')};
        `,
      param,
    };

    this.debug(query.exec);
    this.debug('param', query.param);

    this.debug(queryC.exec);
    this.debug('param', queryC.param);

    const [res, resC] = await this.execScripts([query, queryC]);

    return {
      data: res?.rows || [],
      count: resC?.rows?.[0]?.count || '0',
    };
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
