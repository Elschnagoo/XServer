import {
  CoreClient,
  ICoreKernel,
  ICoreKernelModule,
  XUtil,
} from '@grandlinex/kernel';
import { FormatsEntity, FullResourceMeta, ResourceMeta } from '../lib';
import Downloader from '../class/Downloader';

export default class YTClient extends CoreClient<
  ICoreKernel<any>,
  null,
  null,
  null,
  null
> {
  cmd: string;

  constructor(mod: ICoreKernelModule<any, any, any, any, any>) {
    super('yt-client', mod);
    this.cmd = this.getConfigStore().get('YTDL_CMD') || 'youtube-dl';
    this.debug('YTDL_CMD', this.cmd);
  }

  // eslint-disable-next-line class-methods-use-this
  testTargetUrl(url: string) {
    return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(
      url,
    );
  }

  async getFullResourceInfo(
    url: string,
    opts?: string[],
  ): Promise<FullResourceMeta[] | null> {
    if (!this.testTargetUrl(url)) {
      return null;
    }

    const args = ['--skip-download', '-j'];
    if (opts) {
      args.push(...opts);
    }
    const res = await XUtil.exec(this.cmd, [...args, url], {
      onStdErr: (data: string) => {
        this.error(Buffer.from(data).toString('utf-8'));
      },
    });

    if (res.exitCode !== null && res.exitCode !== 0) {
      this.log(res.exitCode, res.stderr);
      return null;
    }

    try {
      const lines = res.stdout.split('\n').filter((l) => l.length > 0);
      const outMeta: FullResourceMeta[] = [];
      for (const line of lines) {
        const metaRaw: ResourceMeta = JSON.parse(line);
        const fMeta: FullResourceMeta = {
          ...metaRaw,
          directStream: this.getBestSource(metaRaw),
        };
        outMeta.push(fMeta);
      }
      return outMeta;
    } catch (e) {
      this.error(e);
      return null;
    }
  }

  private getBestSource(info: ResourceMeta): FormatsEntity | null {
    const format = info.formats
      ?.filter((f) => f.acodec !== 'none' && f.vcodec !== 'none')
      .sort((a, b) => {
        if (b.quality && a.quality) {
          return b.quality - a.quality;
        }
        if (b.height && a.height) {
          return b.height - a.height;
        }
        return 0;
      });

    return format?.[0] || null;
  }

  async getFileDownloader(fPath: string): Promise<Downloader> {
    return new Downloader(this.getModule(), fPath, this.cmd);
  }
}
