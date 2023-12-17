import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import YTDLMod from '../../../YTDL/YTDLMod';
import WatchClient from '../../client/WatchClient';

@SPath({
  '/download/label': {
    post: {
      tags: ['Watch'],
      operationId: 'downloadLabelSuggestions',
      summary: 'Download label suggestions',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          url: {
            type: 'string',
          },
        },
        required: ['url'],
      }),
      responses: SPathUtil.jsonResponse(
        '200',
        {
          type: 'object',
          properties: {
            search: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                  },
                },
                required: ['text'],
              },
            },
            label: {
              type: 'array',
              items: {
                $ref: SPathUtil.schemaPath('Label'),
              },
            },
          },
          required: ['search', 'label'],
        },
        false,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class DownloadLabelSuggestionsAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('POST', '/download/label', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req }: XActionEvent): Promise<void> {
    const { body } = req;
    const { url } = body;
    if (!url) {
      res.sendStatus(400);
      return;
    }

    const client = this.getModule().getClient();
    const mod = this.getModule().getBridgeModule<YTDLMod>('yt-dl')!;

    const ytClient = mod.getClient();
    const info = await ytClient.getFullResourceInfo(url);
    if (!info || info.length === 0) {
      res.sendStatus(404);
      return;
    }
    const searchSet = new Set<string>();

    info.forEach((i) => {
      searchSet.add(i.title.toLowerCase());
      i.tags?.forEach((t) => {
        if (t) {
          searchSet.add(t.toLowerCase());
        }
      });
      i.categories?.forEach((t) => {
        if (t) {
          searchSet.add(t.toLowerCase());
        }
      });
    });

    res.status(200).send({
      search: Array.from(searchSet).map((s) => ({ text: s })),
      label: await client.labelFromString(...Array.from(searchSet)),
    });
  }
}
