import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import Path from 'path';
import fs from 'fs';
import { ILogChannel, XUtil } from '@grandlinex/kernel';

export default class ThumbVFactory {
  private readonly workdir: string;

  private videoUrl: string;

  private logger?: ILogChannel;

  private duration = 2;

  private parts = 8;

  private debug = false;

  constructor(workdir: string, videoUrl: string, logger?: ILogChannel) {
    this.workdir = workdir;
    this.videoUrl = videoUrl;
    this.logger = logger;
    if (!fs.existsSync(videoUrl)) {
      throw (
        this.logger?.lError(`File not found: ${videoUrl}`) ||
        new Error(`File not found: ${videoUrl}`)
      );
    }
  }

  // ---------------------- GIF SECTION ----------------------
  private static pad(num: number) {
    const base = `000${num}`;
    return base.substring(base.length - 4);
  }

  exeFfmpeg(
    cmd: FfmpegCommand,
    type: string,
    print = false,
    cmdStart?: (cmd: FfmpegCommand) => void,
  ): Promise<boolean> {
    if (print) {
      this.logger?.log(cmd._getArguments().join(' '));
    }
    return new Promise((resolve) => {
      cmd
        .on('end', () => {
          this.logger?.log(`${type} generated successfully!`);
          resolve(true);
        })
        .on('error', (err) => {
          this.logger?.error(`Error generating ${type} : ${err.message}`);
          resolve(false);
        });
      if (cmdStart) {
        cmdStart(cmd);
      } else {
        cmd.run();
      }
    });
  }

  private async generateFrames(index: number, start: number, duration: number) {
    return this.exeFfmpeg(
      ffmpeg(this.videoUrl)
        .setStartTime(start)
        .setDuration(duration)
        .size('512x288')
        .fps(30)
        .noAudio()
        .outputFormat('webm')
        .output(Path.join(this.workdir, `part-${index}.webm`)),
      `FRAMES-${index}`,
      this.debug,
    );
  }

  private async generateVideo(start = 0, end = 5) {
    const outputFilename = Path.join(this.workdir, 'tn_x.webm');

    const cmd = ffmpeg();
    for (let i = start; i <= end; i++) {
      cmd.mergeAdd(Path.join(this.workdir, `part-${i}.webm`));
    }
    return this.exeFfmpeg(cmd, 'VIDEO', this.debug, (c) => {
      c.mergeToFile(outputFilename, this.workdir);
    });
  }

  private async cleanupFiles() {
    const files = await fs.promises.readdir(this.workdir, {
      withFileTypes: true,
    });
    for (const file of files) {
      if (file.name.startsWith('part-')) {
        await fs.promises.rm(Path.join(this.workdir, file.name));
      }
    }
  }

  // ---------------------- GIF SECTION ----------------------

  public async run(max: number) {
    XUtil.createFolderIfNotExist(this.workdir);
    let error = false;

    const part = Math.floor(max / (this.parts + 1));
    await this.generateFrames(0, 0, this.duration);
    if (part > this.duration) {
      for (let i = 1; i <= this.parts; i++) {
        await this.generateFrames(i, i * part, this.duration);
      }
      error = !(await this.generateVideo(0, this.parts));
    } else {
      error = !(await this.generateVideo(0, 0));
    }

    await this.cleanupFiles();
    return !error;
  }
}
