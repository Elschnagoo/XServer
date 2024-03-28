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
import { FullResourceMeta } from '../../../YTDL/lib';

@SPath({
  '/movie/suggestion': {
    post: {
      tags: ['Watch'],
      operationId: 'findVideoSuggestions',
      summary: 'Find video suggestions',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          element: {
            type: 'string',
          },
          url: {
            type: 'string',
          },
          direct: {
            type: 'boolean',
          },
          page: {
            type: 'number',
          },
          title: {
            type: 'string',
          },
        },
        required: ['url', 'element'],
      }),
      responses: SPathUtil.jsonResponse(
        '200',
        {
          type: 'object',
          properties: {
            meta: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                url: {
                  type: 'string',
                },
                thumbnail: {
                  type: 'string',
                },
                duration: {
                  type: 'number',
                },
              },
              required: ['title', 'url', 'duration'],
            },
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
          required: ['search', 'label', 'meta'],
        },
        true,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class FindVideoSuggestionsAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('POST', '/movie/suggestion', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req }: XActionEvent): Promise<void> {
    const { body } = req;
    const { url, element, page, title, direct } = body;
    if (!url) {
      res.sendStatus(400);
      return;
    }

    if (page !== undefined && typeof page !== 'number') {
      res.sendStatus(400);
      return;
    }

    if (title !== undefined && typeof title !== 'string') {
      res.sendStatus(400);
      return;
    }

    const db = this.getModule().getDb();
    const el = await db.movieLib.getObjById(element);
    if (!el) {
      res.sendStatus(404);

      return;
    }

    const client = this.getModule().getClient();
    const mod = this.getModule().getBridgeModule<YTDLMod>('yt-dl')!;

    const ytClient = mod.getClient();

    let info: FullResourceMeta[] | null;
    if (direct) {
      info = await ytClient.getFullResourceInfo(url);
    } else {
      const start = 1 + (page ?? 0) * 3;
      const end = 3 + (page ?? 0) * 3;
      const rUrl =
        url +
        encodeURIComponent(title ?? el.movie_name)
          .replace(/%20/g, '+')
          .replace(/[\s~`!@#$%^&*(){}[\];:"'<,.>?/\\|_-]/g, '');
      this.debug('rUrl', rUrl);
      info = await ytClient.getFullResourceInfo(rUrl, [
        '--playlist-star',
        start.toString(),
        '--playlist-end',
        end.toString(),
      ]);
    }

    if (!info || info.length === 0) {
      res.sendStatus(404);
      return;
    }

    const els = info.map((i) => {
      const searchSet = new Set<string>();
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
      return {
        searchSet,
        meta: {
          title: i.title,
          url: i.webpage_url,
          duration: i.duration,
          thumbnail: i.thumbnail,
        },
      };
    });

    res.status(200).send(
      await Promise.all(
        els.map(async ({ searchSet, meta }) => {
          return {
            meta,
            search: Array.from(searchSet).map((s) => ({ text: s })),
            label: await client.labelFromString(...Array.from(searchSet)),
          };
        }),
      ),
    );
  }
}
