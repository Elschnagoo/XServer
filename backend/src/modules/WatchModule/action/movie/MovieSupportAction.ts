import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';
import { WatchDB } from '../../database';
import BrowserSupport from '../../lib/BrowserSupport';

@SPath({
  '/test/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getMovieSupport',
      summary: 'Check supported Movie codec',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      responses: SPathUtil.jsonResponse(
        '200',
        {
          type: 'object',
          properties: {
            video: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                },
                supported: {
                  type: 'boolean',
                },
              },
              required: ['code', 'supported'],
            },
            audio: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                },
                supported: {
                  type: 'boolean',
                },
              },
              required: ['code', 'supported'],
            },
            browser: {
              type: 'string',
            },
            raw: {
              type: 'string',
            },
          },
        },
        false,
        '400',
        '500',
      ),
    },
  },
})
export default class MovieSupportAction extends BaseApiAction<
  IKernel,
  WatchDB
> {
  constructor(module: IBaseKernelModule<IKernel, any, any, any, any>) {
    super('GET', '/test/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ req, res, agent }: XActionEvent): Promise<void> {
    const support = new BrowserSupport(agent);

    const { id } = req.params;
    const db = this.getModule().getDb();
    const lib = await db.movieLib.getObjById(id);
    if (!lib) {
      res.sendStatus(404);
      return;
    }
    const file = (await db.file.getObjById(lib.lib_file))!;

    if (!file.file_meta) {
      res.sendStatus(500);
      return;
    }

    const v = file.file_meta.streams.find((e) => e.codec_type === 'video');
    const a = file.file_meta.streams.find((e) => e.codec_type === 'audio');

    res.status(200).send({
      video: {
        code: v?.codec_name || 'none',
        supported: support.canPlayVideoCodec(v?.codec_name),
      },
      audio: {
        code: a?.codec_name || 'none',
        supported: support.canPlayAudioCodec(a?.codec_name),
      },
      browser: agent.getBrowser(),
      versions: {
        chrome: agent.getChromeVersion(),
        firefox: agent.getFirefoxVersion(),
        safari: agent.getSafariVersion(),
        mozilla: agent.getMozillaVersion(),
        gecko: agent.getGeckoVersion(),
        oculus: agent.getOculusVersion(),
        edge: agent.getEdgeVersion(),
        opera: agent.getOperaVersion(),
      },
      raw: agent.getRaw(),
    });
  }
}
