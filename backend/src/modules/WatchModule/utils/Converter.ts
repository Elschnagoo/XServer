import { CoreLogChannel, IHaveLogger, XResponse } from '@grandlinex/kernel';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import LibFile from '../database/entities/LibFile';
import MediaUtil from './MediaUtil';

export default class Converter extends CoreLogChannel {
  constructor(log: IHaveLogger) {
    super('converter', log);
  }

  stream(file: LibFile, res: XResponse, profile: string | null | undefined) {
    switch (profile) {
      case 'best':
        this.liveConvertVideo(file.file_path, res);
        break;
      case 'low':
        this.liveConvertVideoLOW(file.file_path, res);
        break;
      case 'medium':
        this.liveConvertVideoMEDIUM(file.file_path, res);
        break;
      case 'raw':
        res.status(200).sendFile(file.file_path);
        break;
      case undefined:
      case null:
      default:
        if (MediaUtil.fileHasWebVideoCodec(file)) {
          res.status(200).sendFile(file.file_path);
        } else {
          this.liveConvertVideoMEDIUM(file.file_path, res);
        }
    }
  }

  writeHeader(path: string, res: XResponse) {
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
  }

  liveConvertVideoMEDIUM(path: string, res: XResponse): void {
    this.writeHeader(path, res);
    ffmpeg(path)
      .videoCodec('libx264')
      .addOption('-ac 2')
      .addOption('-movflags frag_keyframe+empty_moov')
      .size('1280x720')
      .toFormat('mp4')
      .on('stderr', (er) => {
        this.debug(er);
      })
      .on('error', (er) => {
        this.error(er);
      })
      .pipe(res, { end: true });
  }

  liveConvertVideoLOW(path: string, res: XResponse): void {
    this.writeHeader(path, res);
    ffmpeg(path)
      .videoCodec('libx264')
      .addOption('-ac 2')
      .addOption('-movflags frag_keyframe+empty_moov')
      .size('720x480')
      .toFormat('mp4')
      .on('stderr', (er) => {
        this.debug(er);
      })
      .on('error', (er) => {
        this.error(er);
      })
      .pipe(res, { end: true });
  }

  liveConvertVideo(path: string, res: XResponse): void {
    this.writeHeader(path, res);
    ffmpeg(path)
      .videoCodec('libx264')
      .addOption('-ac 2')
      .addOption('-movflags frag_keyframe+empty_moov')
      .toFormat('mp4')
      .on('stderr', (er) => {
        this.debug(er);
      })
      .on('error', (er) => {
        this.error(er);
      })
      .pipe(res, { end: true });
  }
}
