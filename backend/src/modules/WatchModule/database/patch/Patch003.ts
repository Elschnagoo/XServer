import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';

export default class Patch003 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('2', '3', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const [atx1, atx2, atx3] = await db.execScripts([
      {
        exec: `ALTER TABLE ${db.schemaName}.lib_file ADD duration INTEGER;`,
        param: [],
      },
      {
        exec: `UPDATE ${db.schemaName}.lib_file SET synced=false WHERE synced is true;`,
        param: [],
      },
    ]);

    return !!atx1 && !!atx2;
  }
}
