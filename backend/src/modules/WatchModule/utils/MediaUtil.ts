import Path from 'path';
import LibFile from '../database/entities/LibFile';
import { WatchDB } from '../database';

export default class MediaUtil {
  static SupportedVideoContainer = [
    '.mp4',
    '.mov',
    '.m4v',
    '.mkv',
    '.flv',
    '.avi',
    '.webm',
  ];

  static SupportedWebVideoCodec = ['h264', 'vp8', 'vp9'];

  static SupportedWebVideoContainer = [
    'mov,mp4,m4a,3gp,3g2,mj2',
    'matroska,webm',
  ];

  static fileHasWebVideoCodec(file: LibFile): boolean {
    return (
      !!file.file_meta &&
      !!file.file_meta.streams.find((stream) =>
        this.SupportedWebVideoCodec.includes(stream.codec_name)
      ) &&
      this.SupportedWebVideoContainer.includes(
        file.file_meta.format.format_name
      )
    );
  }

  static isSupportedVideoContainer(path: string): boolean {
    return MediaUtil.SupportedVideoContainer.includes(
      Path.extname(path).toLowerCase()
    );
  }

  static async prioritizeFile(
    db: WatchDB,
    files: string[],
    type: 'web' | 'best'
  ): Promise<LibFile | null> {
    if (type === 'web') {
      return this.prioritizeWebFile(db, files);
    }
    if (type === 'best') {
      return this.prioritizeBestFile(db, files);
    }
    return null;
  }

  static async prioritizeWebFile(
    db: WatchDB,
    files: string[]
  ): Promise<LibFile | null> {
    if (files.length === 0) {
      return null;
    }
    if (files.length === 1) {
      return db.file.getObjById(files[0]);
    }
    const f = await Promise.all(files.map((c) => db.file.getObjById(c)));

    const webFile = f.find((c) => {
      return c && this.fileHasWebVideoCodec(c);
    });
    if (webFile) {
      return webFile;
    }
    return f?.[0] || null;
  }

  static async prioritizeBestFile(
    db: WatchDB,
    files: string[]
  ): Promise<LibFile | null> {
    if (files.length === 0) {
      return null;
    }
    if (files.length === 1) {
      return db.file.getObjById(files[0]);
    }
    const f = await Promise.all(files.map((c) => db.file.getObjById(c)));

    let bestFile: LibFile | null = null;
    let bestFileSize = BigInt(0);
    f.forEach((c) => {
      const size = BigInt(c?.file_meta?.format.size || 0);
      if (!bestFile) {
        bestFile = c;
        bestFileSize = size;
      } else if (size > bestFileSize) {
        bestFile = c;
        bestFileSize = size;
      }
    });

    return bestFile || f?.[0] || null;
  }
}
