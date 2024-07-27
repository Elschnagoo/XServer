import {
  BaseApiAction,
  IBaseKernelModule,
  IKernel,
  SPath,
  SPathUtil,
  XActionEvent,
} from '@grandlinex/kernel';

import { WatchDB } from '../../database';
import Label from '../../database/entities/Label';
import WatchClient from '../../client/WatchClient';

@SPath({
  '/suggest/label/{id}': {
    get: {
      tags: ['Watch'],
      operationId: 'getLabelSuggestions',
      summary: 'Get label suggestions',
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
      responses: SPathUtil.refResponse(
        '200',
        new Label(),
        true,
        '400',
        '404',
        '500',
      ),
    },
  },
})
export default class GetLabelSuggestionAction extends BaseApiAction<
  IKernel,
  WatchDB,
  WatchClient
> {
  constructor(
    module: IBaseKernelModule<IKernel, WatchDB, WatchClient, any, any>,
  ) {
    super('GET', '/suggest/label/:id', module, module.getKernel().getModule());
    this.handler = this.handler.bind(this);
  }

  async handler({ res, req }: XActionEvent): Promise<void> {
    const client = this.getModule().getClient();

    const db = this.getModule().getDb();
    const cur = await db.movieLib.getObjById(req.params.id);
    if (!cur) {
      res.sendStatus(404);
      return;
    }

    const outLabel: Label[] = [
      ...(await client.labelFromString(cur.movie_name || '')),
    ];
    const [nearLabel] = await db.execScripts([
      {
        exec: `SELECT l.*
                FROM (SELECT label, SUM(1) AS sum
                      FROM watch.label_map
                      WHERE label_map.mov_lib IN (SELECT DISTINCT mov_lib
                                                  FROM watch.label_map
                                                  WHERE label in (SELECT DISTINCT label
                                                                  FROM watch.label_map
                                                                  WHERE mov_lib = $1))
                        AND label NOT in (SELECT DISTINCT label
                                          FROM watch.label_map
                                          WHERE mov_lib = $1)
                      GROUP BY label
                      ORDER BY sum DESC
                      LIMIT 30) AS q JOIN watch.label AS l ON q.label=l.e_id
                ORDER BY q.sum DESC ,l.label_order;`,
        param: [cur.e_id],
      },
    ]);

    nearLabel?.rows.forEach((l: Label) => {
      if (!outLabel.find((e) => e.e_id === l.e_id)) {
        outLabel.push(l);
      }
    });
    res.status(200).send(outLabel);
  }
}
