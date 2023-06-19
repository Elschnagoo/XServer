import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';

export default class Patch002 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('1', '2', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const [atx1, atx2, atx3] = await db.execScripts([
      {
        exec: `ALTER TABLE ${db.schemaName}.lib_path ADD download BOOLEAN;`,
        param: [],
      },
      {
        exec: `UPDATE ${db.schemaName}.lib_path SET download=false WHERE download is null;`,
        param: [],
      },
      {
        exec: `ALTER TABLE ${db.schemaName}.lib_path ALTER COLUMN download SET NOT NULL;`,
        param: [],
      },
    ]);
    const a = await db.getEntityWrapper('DownloadQ')!.init();

    return !!atx1 && !!atx2 && !!atx3 && a;
  }
}
