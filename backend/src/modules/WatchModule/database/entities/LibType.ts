import { CoreEntity, Entity } from '@grandlinex/kernel';

export enum LibTypeEnum {
  'MOVIE' = 'MOVIE',
}

@Entity('LibType')
export default class LibType extends CoreEntity {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props?: LibTypeEnum) {
    super(props);
  }
}
