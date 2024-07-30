import {
  BaseApiAction,
  EntitySchemaExtender,
  IBaseKernelModule,
  IKernel,
  SComponent,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';
import { WatchDB } from '../../database';
import MovieLib from '../../database/entities/MovieLib';
import { inputValidation } from '../../utils/Validation';
import BrowserSupport from '../../lib/BrowserSupport';

const extendedSchema = EntitySchemaExtender.extendEntitySchema(
  new MovieLib(),
  {
    key: 'duration',
    schema: {
      type: 'number',
    },
  },
  {
    key: 'size',
    schema: {
      type: 'number',
    },
  },
  {
    key: 'synced',
    schema: {
      type: 'boolean',
    },
    required: true,
  },
  {
    key: 'video',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
        },
        supported: {
          type: 'boolean',
        },
        quality: {
          type: 'number',
        },
      },
      required: ['code', 'supported', 'quality'],
    },
  },
  {
    key: 'audio',
    schema: {
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
  },
);

@SPath({
  '/movie': {
    post: {
      tags: ['Watch'],
      operationId: 'getMovies',
      summary: 'Get Movies',
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          title: {
            type: 'string',
          },
          needLabel: {
            type: 'string',
          },
          notLabel: {
            type: 'string',
          },
          duration: {
            type: 'string',
          },
          optLabel: {
            type: 'string',
          },
          ratingMin: {
            type: 'number',
          },
          ratingMax: {
            type: 'number',
          },
          page: {
            type: 'number',
          },
          hasLink: {
            type: 'boolean',
          },
          isSynced: {
            type: 'boolean',
          },
          sortOrder: {
            type: 'string',
          },
        },
      }),
      responses: SPathUtil.jsonResponse(
        '200',
        {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: SPathUtil.schemaPath('MovieLib'),
              },
            },
            count: {
              type: 'integer',
            },
          },
          required: ['data', 'count'],
        },
        false,
        '400',
        '500',
      ),
    },
  },
})
@SComponent({
  schemas: {
    ...extendedSchema,
  },
})
export default class MovieAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('POST', '/movie', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req, agent }: XActionEvent): Promise<void> {
    const ops = inputValidation<{
      ratingMin?: number;
      ratingMax?: number;
      page?: number;
      hasLink?: boolean;
      isSynced?: boolean;
      title?: string;
      duration?: string;
      sortOrder?: string;
      needLabel?: string[];
      notLabel?: string[];
      optLabel?: string[];
    }>(req.body, [
      {
        key: 'ratingMin',
        type: 'number',
      },
      {
        key: 'ratingMax',
        type: 'number',
      },
      {
        key: 'page',
        type: 'number',
      },
      {
        key: 'hasLink',
        type: 'boolean',
      },
      {
        key: 'isSynced',
        type: 'boolean',
      },
      {
        key: 'title',
        type: 'string',
      },
      {
        key: 'duration',
        type: 'string',
      },
      {
        key: 'sortOrder',
        type: 'string',
      },
      {
        key: 'needLabel',
        type: 'label',
      },
      {
        key: 'notLabel',
        type: 'label',
      },
      {
        key: 'optLabel',
        type: 'label',
      },
    ]);

    this.debug('Search', ops);

    const db = this.getModule().getDb();

    const dat = await db.searchQuery(ops);
    const support = new BrowserSupport(agent);

    const out = dat.data.map((cur) => {
      const v = cur.file_meta?.streams.find((e) => e.codec_type === 'video');
      const a = cur.file_meta?.streams.find((e) => e.codec_type === 'audio');
      return {
        ...cur,
        size: cur.file_meta?.format.size,
        video: {
          code: v?.codec_name || 'none',
          supported: support.canPlayVideoCodec(v?.codec_name),
          quality: cur.quality,
        },
        audio: {
          code: a?.codec_name || 'none',
          supported: support.canPlayAudioCodec(a?.codec_name),
        },
        file_meta: undefined,
        quality: undefined,
      };
    });

    res.status(200).send({
      data: out,
      count: parseInt(dat.count, 10),
    });
  }
}
