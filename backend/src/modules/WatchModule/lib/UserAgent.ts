import { XRequest } from '@grandlinex/kernel';

/**
 * UserAgent
 */
export default class UserAgent {
  raw: string;

  chrome: number | null = null;

  safari: number | null = null;

  firefox: number | null = null;

  mozilla: number | null = null;

  gecko: number | null = null;

  oculus: number | null = null;

  edge: number | null = null;

  opera: number | null = null;

  vlc: number | null = null;

  constructor(req: XRequest) {
    this.raw = req.headers['user-agent'] || '';
    const parts = this.raw.matchAll(/[A-Za-z]*\/[0-9.]*/gm);
    for (const part of parts) {
      const [name, version] = part[0].split('/');
      const [release] = version.split('.');
      switch (name) {
        case 'OPR':
          this.opera = parseInt(release, 10);
          break;
        case 'Edg':
          this.edge = parseInt(release, 10);
          break;
        case 'Chrome':
          this.chrome = parseInt(release, 10);
          break;
        case 'Safari':
          this.safari = parseInt(release, 10);
          break;
        case 'Firefox':
          this.firefox = parseInt(release, 10);
          break;
        case 'Mozilla':
          this.mozilla = parseInt(release, 10);
          break;
        case 'Gecko':
          this.gecko = parseInt(release, 10);
          break;
        case 'OculusBrowser':
          this.oculus = parseInt(release, 10);
          break;
        case 'VLC':
          this.vlc = parseInt(release, 10);
          break;
        default:
          break;
      }
    }
  }

  getBrowser() {
    if (this.vlc) {
      return 'VLC';
    }
    if (this.opera) {
      return 'Opera';
    }
    if (this.edge) {
      return 'Edge';
    }
    if (this.oculus) {
      return 'OculusBrowser';
    }
    if (this.chrome) {
      return 'Chrome';
    }
    if (this.firefox) {
      return 'Firefox';
    }
    if (this.safari) {
      return 'Safari';
    }
    if (this.mozilla) {
      return 'Mozilla';
    }
    if (this.gecko) {
      return 'Gecko';
    }
    return 'Unknown';
  }

  getChromeVersion(): number {
    return this.chrome || 0;
  }

  getFirefoxVersion(): number {
    return this.firefox || 0;
  }

  getSafariVersion(): number {
    return this.safari || 0;
  }

  getMozillaVersion(): number {
    return this.mozilla || 0;
  }

  getGeckoVersion(): number {
    return this.gecko || 0;
  }

  getOculusVersion(): number {
    return this.oculus || 0;
  }

  getEdgeVersion(): number {
    return this.edge || 0;
  }

  getOperaVersion(): number {
    return this.opera || 0;
  }

  getVLCVersion(): number {
    return this.vlc || 0;
  }
}
