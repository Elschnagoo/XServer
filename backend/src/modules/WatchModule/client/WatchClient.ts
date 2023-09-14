import {
  BaseClient,
  IBaseKernelModule,
  IKernel,
  XUtil,
} from '@grandlinex/kernel';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import Path from 'path';
import { WatchDB } from '../database';
import { ProbeInfo } from '../lib/MediaHandlerTypes';
import MovieLib from '../database/entities/MovieLib';
import LibFile from '../database/entities/LibFile';
import ThumbVFactory from '../utils/ThumbVFactory';

function f(path: string, ...files: string[]) {
  let p = true;
  for (const file of files) {
    if (!fs.existsSync(Path.join(path, file))) {
      p = false;
    }
  }
  return p;
}

export default class WatchClient extends BaseClient<IKernel, WatchDB> {
  private readonly lang: string;

  private readonly mediaPath: string;

  private readonly ffmpeg: string;

  private readonly ffprobe: string;

  private readonly magicPre: string | null;

  constructor(mod: IBaseKernelModule) {
    super('w-client', mod);
    this.lang = 'de';

    const [ffmpegS, ffprobe, magicPre, mpath] = this.getKernel()
      .getConfigStore()
      .getBulk(
        ['FFMPEG_PATH', 'ffmpeg'],
        ['FFPROBE_PATH', 'ffprobe'],
        ['MAGIC_PRE', ''],
        ['MEDIA_PATH', ''],
      );

    this.mediaPath = mpath;
    this.ffmpeg = ffmpegS;
    this.ffprobe = ffprobe;
    this.magicPre = magicPre && magicPre !== '' ? magicPre : null;
  }

  async inspectFile(path: string): Promise<ProbeInfo | null> {
    if (!fs.existsSync(path)) {
      this.error(`File not found: ${path}`);
      return null;
    }

    const r = await XUtil.exec(this.ffprobe, [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      path,
    ]);
    if (r.exitCode !== 0) {
      this.error(`inspection failed with ${r.exitCode}`);
      this.error(r.stderr);
      return null;
    }
    try {
      return JSON.parse(r.stdout);
    } catch (e) {
      this.error(`inspection failed:`);
      this.error(e);
      return null;
    }
  }

  async convertImgAndRm(path: string): Promise<boolean> {
    if (!fs.existsSync(path)) {
      this.error(`File not found: ${path}`);
      return false;
    }

    const outPath = path.replace('png', 'webp');

    const cmd = this.magicPre || 'convert';

    const args = [];
    if (this.magicPre) {
      args.push('convert');
    }

    args.push(path, '-resize', '512x288', outPath);

    const r = await XUtil.exec(cmd, args);
    if (r.exitCode !== 0) {
      this.error(`convert poster failed with ${r.exitCode}`);
      this.error(r.stderr);
    }
    await fs.promises.rm(path);

    return r.exitCode === 0;
  }

  async makeThumbnail(
    path: string,
    imgPath: string,
    duration?: number | null,
  ): Promise<boolean> {
    try {
      const factory = new ThumbVFactory(imgPath, path, this);
      let first;
      let second;
      if (typeof duration === 'number' && !f(imgPath, 'tn_x.webm')) {
        first = await factory.run(duration);
      } else {
        first = true;
      }

      if (!f(imgPath, 'tn_1.webp', 'tn_5.webp')) {
        second = await factory.exeFfmpeg(
          ffmpeg(path).takeScreenshots({ count: 5, fastSeek: true }, imgPath),
          'THUMB',
        );

        if (second) {
          for (let x = 1; x < 6; x++) {
            await this.convertImgAndRm(Path.join(imgPath, `tn_${x}.png`));
          }
        }
      } else {
        second = true;
      }

      return first && second;
    } catch (e) {
      this.error(`Error make thumbnail ${path}`);
      this.error(e);
      return false;
    }
  }

  async deleteMovie(movie: MovieLib, libFile?: LibFile) {
    const db = this.getModule().getDb();
    const media = this.getKernel().getConfigStore().get('MEDIA_PATH')!;
    const mediaPath = Path.join(media, movie.lib, movie.e_id);

    const label = await db.labelMap.getObjList({
      search: { mov_lib: movie.e_id },
    });
    for (const l of label) {
      await db.labelMap.delete(l.e_id);
    }
    await db.movieLib.delete(movie.e_id);

    if (
      fs.existsSync(mediaPath) &&
      (await fs.promises.stat(mediaPath)).isDirectory()
    ) {
      await fs.promises.rm(mediaPath, { recursive: true });
    }
    if (libFile) {
      if (fs.existsSync(libFile.file_path)) {
        await fs.promises.rm(libFile.file_path);
      }
      await db.file.delete(libFile.e_id);
    }
  }
}
