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
import { RatingElementType } from '../database/entities/RatingElement';
import Label from '../database/entities/Label';

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

  async labelFromString(...inputs: string[]): Promise<Label[]> {
    const db = this.getModule().getDb();
    const set = new Set<string>();
    const label = new Set<string>();

    inputs
      .map((d) => d.toLowerCase())
      .forEach((e) => {
        const spl = e.split(' ').filter((c) => c !== '');
        for (let x = 0; x < spl.length; x++) {
          for (let y = 0; y + x < spl.length; y++) {
            set.add(spl.slice(y, y + x + 1).join(' '));
          }
        }
      });
    set.delete('');
    this.debug(Array.from(set));

    const allLabel = await db.label.getObjList();
    for (const cur of set) {
      allLabel
        .filter((e) => cur.includes(e.label_name.toLowerCase()))
        .forEach((e) => label.add(e.e_id));

      const el = await db.labelAlias.getObjList({
        search: {
          alias: cur,
        },
      });
      el.forEach((e) => label.add(e.label));
    }
    return allLabel.filter((e) => label.has(e.e_id));
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
        second = await factory.exeFfmpeg(ffmpeg(path), 'THUMB', false, (c) => {
          c.takeScreenshots({ count: 5, fastSeek: true }, imgPath);
        });

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

    const rat = await db.movRating.getObjList({
      search: {
        movie: movie.e_id,
      },
    });
    for (const r of rat) {
      await db.movRating.delete(r.e_id);
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

  async updateRating(mov: MovieLib): Promise<MovieLib> {
    const db = this.getModule().getDb();
    const maxRatings = await db.ratingEl.getObjList();
    const mx = maxRatings.reduce((a, b) => a + b.rating_value, 0);

    let calc = 0;
    const ratings = await db.movRating.getObjList({
      search: {
        movie: mov.e_id,
      },
    });

    for (const rat of maxRatings) {
      const r = ratings.find((e) => e.element === rat.e_id);
      if (r) {
        const reval = r.rating_value >= 0 ? r.rating_value : 0;
        switch (rat.rating_type) {
          case RatingElementType.BOOL:
            calc += rat.rating_value * reval;
            break;
          case RatingElementType.STAR:
            calc += rat.rating_value * (reval / 5);
            break;
          default:
        }
      }
    }

    await db.movieLib.updateObject(mov.e_id, {
      rating: Math.round((calc / mx) * 5),
    });

    return {
      ...mov,
      rating: Math.round((calc / mx) * 5),
    };
  }
}
