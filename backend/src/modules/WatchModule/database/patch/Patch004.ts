import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';

export default class Patch004 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('3', '4', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const [atx1] = await db.execScripts([
      {
        exec: `ALTER TABLE ${db.schemaName}.download_q ADD label json;`,
        param: [],
      },
    ]);

    return !!atx1;
  }
}
