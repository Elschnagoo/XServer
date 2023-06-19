import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';

export default class Patch001 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('0', '1', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const [atx1, atx2, atx3, atx4] = await db.execScripts([
      {
        exec: `ALTER TABLE ${db.schemaName}.movie_lib ADD rating INTEGER;`,
        param: [],
      },
      {
        exec: `ALTER TABLE ${db.schemaName}.movie_lib ADD disabled BOOLEAN;`,
        param: [],
      },
      {
        exec: `UPDATE ${db.schemaName}.movie_lib SET disabled=false WHERE disabled is null;`,
        param: [],
      },
      {
        exec: `ALTER TABLE ${db.schemaName}.movie_lib ALTER COLUMN disabled SET NOT NULL;`,
        param: [],
      },
    ]);
    const a = await db.getEntityWrapper('Label')!.init();
    const b = await db.getEntityWrapper('LabelMap')!.init();

    return !!atx1 && !!atx2 && !!atx3 && !!atx4 && a && b;
  }
}
