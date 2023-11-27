import * as fs from 'fs';
import Path from 'path';
import Library from '../../database/entities/Library';
import BaseScanner from './BaseScanner';
import LibPath from '../../database/entities/LibPath';
import LibFile from '../../database/entities/LibFile';
import MovieLib from '../../database/entities/MovieLib';
import MediaUtil from '../../utils/MediaUtil';
import LabelMap from '../../database/map/LabelMap';

export function niceName(name: string) {
  let tName = Path.parse(name).name;
  tName = tName.replace(/[^a-zA-Z0-9',()]+/gm, ' ');
  tName = tName.replace(/[\d]{3,4}p$/gm, '');
  tName = tName.trim();
  tName = tName.replace(/\s\s+/g, ' ');
  return tName;
}
export default class MovieScanner extends BaseScanner {
  async fileAdd(
    lib: Library,
    path: LibPath,
    fPath: string,
    name: string,
    labelList?: string[],
  ): Promise<void> {
    try {
      if (!(await this.db.file.findObj({ file_path: fPath }))) {
        if (MediaUtil.isSupportedVideoContainer(fPath)) {
          const fId = (
            await this.db.file.createObject(
              new LibFile({
                lib_path: path.e_id,
                file_meta: null,
                file_path: fPath,
                lib: lib.e_id,
                synced: false,
                duration: null,
              }),
            )
          ).e_id;
          const mId = await this.db.movieLib.createObject(
            new MovieLib({
              created: new Date(),
              lib: lib.e_id,
              movie_description: null,
              movie_name: niceName(name),
              synced: false,
              disabled: false,
              rating: null,
              lib_file: fId,
              last_played: null,
              played_count: null,
            }),
          );
          if (labelList) {
            for (const label of labelList) {
              try {
                await this.db.labelMap.createObject(
                  new LabelMap({
                    label,
                    mov_lib: mId.e_id,
                  }),
                );
              } catch (e) {
                this.chanel.error(`Can't add label ${label}`);
                this.chanel.error(e);
              }
            }
          }
        }
      }
    } catch (e) {
      this.chanel.error(e);
    }
  }

  async scanFolder(lib: Library, path: LibPath): Promise<void> {
    const { lib_path, e_id } = path;
    if (fs.existsSync(lib_path)) {
      const stat = await fs.promises.stat(lib_path);
      if (stat.isDirectory()) {
        const files = await fs.promises.readdir(lib_path);
        for (const file of files) {
          const curFile = Path.join(lib_path, file);
          const cStat = await fs.promises.stat(curFile);
          if (cStat.isDirectory()) {
            const deepFiles = await fs.promises.readdir(curFile);
            for (const deepFile of deepFiles) {
              const deepCurFile = Path.join(curFile, deepFile);
              const deepCStat = await fs.promises.stat(deepCurFile);
              if (deepCStat.isFile()) {
                await this.fileAdd(lib, path, deepCurFile, deepFile);
              }
            }
          } else if (cStat.isFile()) {
            await this.fileAdd(lib, path, curFile, file);
          }
        }
      } else {
        this.chanel.error(`Path ${lib_path} is not a directory [${e_id}]`);
      }
    } else {
      this.chanel.error(`Path ${lib_path} not found [${e_id}]`);
    }
  }

  async clean(lib: Library, pageSize = 50): Promise<void> {
    let offset = 0;
    let limit = pageSize;
    let movie = await this.db.movieLib.getObjList({
      search: { lib: lib.e_id },
      offset,
      limit,
    });
    while (movie.length > 0) {
      for (const m of movie) {
        const file = await this.db.file.findObj({ e_id: m.lib_file });
        if (!file) {
          this.chanel.error(`File ${m.lib_file} not found`);
          await this.client.deleteMovie(m);
        } else if (!fs.existsSync(file.file_path)) {
          await this.client.deleteMovie(m, file);
          this.chanel.log(`File [${file.file_path}] not found`);
        }
      }
      offset += pageSize;
      limit += pageSize;
      movie = await this.db.movieLib.getObjList({
        search: { lib: lib.e_id },
        offset,
        limit,
      });
    }
  }
}
