import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';

export default class Patch005 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('4', '5', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const [atx1] = await db.execScripts([
      {
        exec: `UPDATE ${db.schemaName}.movie_lib SET synced = false WHERE synced = true;`,
        param: [],
      },
    ]);

    return !!atx1;
  }
}
