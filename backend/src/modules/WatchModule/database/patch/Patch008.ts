import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';

export default class Patch008 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('7', '8', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const [atx1, atx2] = await db.execScripts([
      {
        exec: `alter table ${db.schemaName}.movie_lib add last_played timestamp;`,
        param: [],
      },
      {
        exec: `alter table ${db.schemaName}.movie_lib add played_count integer;`,
        param: [],
      },
    ]);

    return !!atx1 && !!atx2;
  }
}
