import { BaseUserAgent } from '@grandlinex/kernel';
import Path from 'path';

type CodecMinReq = {
  name: string[];
  chrome?: number;
  safari?: number;
  firefox?: number;
  mozilla?: number;
  gecko?: number;
  oculus?: number;
  edge?: number;
  opera?: number;
};

/**
 * {
 *     name: 'name',
 *     chrome: 0,
 *     safari: 0,
 *     firefox: 0,
 *     mozilla: 0,
 *     gecko: 0,
 *     oculus: 0,
 *     edge: 0,
 *     opera: 0,
 *   },
 */

export default class BrowserSupport {
  static SupportedVideoContainer = [
    '.mp4',
    '.mov',
    '.m4v',
    '.mkv',
    '.flv',
    '.avi',
    '.webm',
  ];

  static vCodecMinReq: CodecMinReq[] = [
    {
      name: ['h264', 'H264'],
      chrome: 4,
      safari: 4,
      firefox: 35,
      edge: 12,
      opera: 25,
    },
    {
      name: ['hevc'],
      chrome: 107,
      safari: 13,
      edge: 79,
      opera: 94,
    },
    {
      name: ['vp8', 'Vp8', 'vp9', 'Vp9'],
      chrome: 25,
      safari: 16,
      firefox: 28,
      edge: 79,
      opera: 16,
    },
  ];

  static aCodecMinReq: CodecMinReq[] = [
    {
      name: ['aac', 'AAC'],
      chrome: 12,
      safari: 4,
      firefox: 22,
      edge: 12,
      opera: 15,
    },
    {
      name: ['opus', 'OPUS'],
      chrome: 33,
      safari: 11,
      firefox: 15,
      edge: 14,
      opera: 20,
    },
  ];

  static isSupportedVideoContainer(path: string): boolean {
    return BrowserSupport.SupportedVideoContainer.includes(
      Path.extname(path).toLowerCase(),
    );
  }

  agent: BaseUserAgent;

  constructor(agent: BaseUserAgent) {
    this.agent = agent;
  }

  canPlayVideoCodec(codec?: string): boolean {
    if (!codec) {
      return false;
    }
    const c = BrowserSupport.vCodecMinReq.find((vCodec) =>
      vCodec.name.includes(codec),
    );
    return this.testCodec(c);
  }

  canPlayAudioCodec(codec?: string): boolean {
    if (!codec) {
      return false;
    }
    const c = BrowserSupport.aCodecMinReq.find((vCodec) =>
      vCodec.name.includes(codec),
    );
    return this.testCodec(c);
  }

  private testCodec(c: CodecMinReq | undefined) {
    if (!c) {
      return false;
    }
    if (this.agent.getXVersion('vlc') > 0) {
      return true;
    }
    if (c.oculus !== undefined && c.oculus <= this.agent.getOculusVersion()) {
      return true;
    }
    if (c.edge !== undefined && c.edge <= this.agent.getEdgeVersion()) {
      return true;
    }
    if (c.opera !== undefined && c.opera <= this.agent.getOperaVersion()) {
      return true;
    }
    if (
      c.firefox !== undefined &&
      c.firefox <= this.agent.getFirefoxVersion()
    ) {
      return true;
    }
    if (c.chrome !== undefined && c.chrome <= this.agent.getChromeVersion()) {
      return true;
    }
    if (c.safari !== undefined && c.safari <= this.agent.getSafariVersion()) {
      return true;
    }
    if (
      c.mozilla !== undefined &&
      c.mozilla <= this.agent.getMozillaVersion()
    ) {
      return true;
    }
    if (c.gecko !== undefined && c.gecko <= this.agent.getGeckoVersion()) {
      return true;
    }

    return false;
  }
}
