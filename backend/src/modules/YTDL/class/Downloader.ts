import {
  CoreLogChannel,
  CoreLogger,
  IHaveLogger,
  XUtil,
} from '@grandlinex/kernel';
import * as fs from 'fs';
import * as path from 'path';

export default class Downloader extends CoreLogChannel {
  cmd: string;

  fPath: string;

  constructor(
    log: IHaveLogger | CoreLogger,
    fPath: string,
    cmd = 'youtube-dl'
  ) {
    super('Downloader', log);
    this.cmd = cmd;
    this.fPath = fPath;
  }

  checkEmptyFolder(): boolean {
    if (!fs.existsSync(this.fPath)) {
      return false;
    }
    const stat = fs.statSync(this.fPath);
    if (!stat.isDirectory()) {
      return false;
    }
    const files = fs.readdirSync(this.fPath);
    return files.length === 0;
  }

  private getFolderFiles(): { fullPath: string; fileName: string }[] | null {
    if (!fs.existsSync(this.fPath)) {
      return null;
    }
    const stat = fs.statSync(this.fPath);
    if (!stat.isDirectory()) {
      return null;
    }
    const files = fs.readdirSync(this.fPath);

    return files.map((x) => ({
      fullPath: path.join(this.fPath, x),
      fileName: x,
    }));
  }

  clearFolder(): boolean {
    if (!fs.existsSync(this.fPath)) {
      return true;
    }
    const stat = fs.statSync(this.fPath);
    if (!stat.isDirectory()) {
      return true;
    }
    const files = fs.readdirSync(this.fPath);
    try {
      for (const file of files) {
        fs.rmSync(path.join(this.fPath, file));
      }
    } catch (e) {
      this.error(e);
      return false;
    }
    return true;
  }

  async downloadResource(
    url: string,
    log = false
  ): Promise<{ fullPath: string; fileName: string }[] | null> {
    if (!this.checkEmptyFolder()) {
      this.error('Folder not empty or not exist');
      return null;
    }
    if (log) {
      this.log(`Start download: ${url}`);
    }

    const res = await XUtil.exec('yt-dlp', [
      '--output',
      path.join(this.fPath, '%(title)s.%(ext)s'),
      url,
    ]);
    if (res.exitCode !== 0) {
      this.error(res.stderr);
      this.clearFolder();
      return null;
    }
    if (log) {
      this.log(res.stdout);
    }
    return this.getFolderFiles();
  }
}
