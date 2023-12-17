import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';
import LabelAlias from '../entities/LabelAlias';

export default class Patch009 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('8', '9', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const element = db.getEntityWrapper<LabelAlias>('LabelAlias')!;
    const [ex1] = await db.execScripts([
      {
        exec: `alter table ${db.schemaName}.movie_lib add movie_url text;`,
        param: [],
      },
    ]);
    return (await element.init()) && !!ex1;
  }
}
