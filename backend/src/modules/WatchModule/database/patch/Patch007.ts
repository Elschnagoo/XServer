import { CoreDBUpdate } from '@grandlinex/kernel';
import PGCon from '@grandlinex/bundle-postgresql';
import RatingElement, { RatingElementType } from '../entities/RatingElement';
import MovieRating from '../entities/MovieRating';

export default class Patch007 extends CoreDBUpdate<PGCon> {
  constructor(con: PGCon) {
    super('6', '7', con);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const element = db.getEntityWrapper<RatingElement>('RatingElement')!;
    const rating = db.getEntityWrapper<MovieRating>('MovieRating')!;

    const old = (await element.getObjList()) as any[];

    await db.execScripts([
      {
        exec: `DROP TABLE ${db.schemaName}.rating_element;`,
        param: [],
      },
    ]);

    const good = (await element.init()) && (await rating.init());

    for (const cur of old) {
      await element.createObject(
        new RatingElement({
          icon: cur.icon,
          rating_order: cur.rating_order,
          rating_value: cur.rating_value,
          rating_label: cur.rating_label,
          rating_type: RatingElementType.BOOL,
        }),
      );
    }

    return good;
  }
}
