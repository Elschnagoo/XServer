import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';

export default class Patch006 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('5', '6', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const a = await db.getEntityWrapper('RatingElement')!.init();

    return a;
  }
}
