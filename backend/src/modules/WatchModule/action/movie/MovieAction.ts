import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  JwtToken,
  XRequest,
  XResponse,
} from '@grandlinex/kernel';

import { SComponent, SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { WatchDB } from '../../database';
import MovieLib from '../../database/entities/MovieLib';
import { isUUID } from '../../utils/Validation';

const extendedSchema: any = SPathUtil.schemaEntryGen(new MovieLib()).MovieLib;
extendedSchema.properties = {
  ...extendedSchema.properties,
  duration: {
    type: 'number',
  },
};

@SPath({
  '/movie': {
    get: {
      tags: ['Watch'],
      operationId: 'getMovies',
      summary: 'Get Movies',
      parameters: [
        {
          name: 'label',
          in: 'query',
          description: 'Label',
          required: false,
          schema: {
            type: 'string',
          },
        },
        {
          name: 'exclude',
          in: 'query',
          description: 'Label',
          required: false,
          schema: {
            type: 'string',
          },
        },
        {
          name: 'min',
          in: 'query',
          description: 'Rating Min',
          required: false,
          schema: {
            type: 'string',
          },
        },
        {
          name: 'max',
          in: 'query',
          description: 'Rating Max',
          required: false,
          schema: {
            type: 'string',
          },
        },
      ],
      responses: SPathUtil.refResponse(
        '200',
        new MovieLib(),
        true,
        '400',
        '500',
      ),
    },
  },
})
@SComponent({
  schemas: {
    MovieLib: extendedSchema,
  },
})
export default class MovieAction extends BaseApiAction<IKernel, WatchDB> {
  constructor(module: IBaseKernelModule<IKernel, WatchDB, any, any, any>) {
    super('GET', '/movie', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken | null,
  ): Promise<void> {
    if (data) {
      const { min, max, label, exclude } = req.query;

      let mi: number | undefined;
      let ma: number | undefined;
      try {
        mi = typeof min === 'string' ? parseInt(min as string, 10) : undefined;
      } catch (e) {
        this.error(e);
        res.sendStatus(400);
        return;
      }
      try {
        ma = typeof max === 'string' ? parseInt(max as string, 10) : undefined;
      } catch (e) {
        this.error(e);
        res.sendStatus(400);
        return;
      }
      const lab = this.convertLabel(label);
      const exc = this.convertLabel(exclude);
      if (lab === null || exc === null) {
        res.sendStatus(400);
        return;
      }

      const db = this.getModule().getDb();
      const dat = await db.searchQuery(mi, ma, lab, exc);

      res.status(200).send(dat);
      return;
    }

    res.sendStatus(403);
  }

  convertLabel(label?: unknown): string[] | undefined | null {
    let lab: string[] | undefined;
    try {
      if (label) {
        if (typeof label !== 'string') {
          return null;
        }
        lab = label.split(';');
        let valid = true;
        lab.forEach((cur) => {
          if (!isUUID(cur)) {
            valid = false;
          }
        });
        if (!valid) {
          return null;
        }
      }
    } catch (e) {
      this.error(e);
      return null;
    }
    return lab;
  }
}
