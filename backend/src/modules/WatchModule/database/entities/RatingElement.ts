import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/kernel';

export enum RatingElementType {
  'BOOL' = 'BOOL',
  'STAR' = 'STAR',
}

@Entity('RatingElement')
export default class RatingElement extends CoreEntity {
  @Column({
    dataType: 'string',
    unique: true,
  })
  rating_label: string;

  @Column({
    dataType: 'int',
  })
  rating_order: number;

  @Column({
    dataType: 'int',
  })
  rating_value: number;

  @Column({
    dataType: 'string',
  })
  rating_type: RatingElementType;

  @Column({
    dataType: 'string',
    canBeNull: true,
  })
  icon: string | null;

  constructor(props?: EProperties<RatingElement>) {
    super();
    this.rating_label = props?.rating_label || '';
    this.icon = props?.icon ?? null;
    this.rating_order = props?.rating_order ?? 0;
    this.rating_value = props?.rating_value ?? 0;
    this.rating_type = props?.rating_type ?? RatingElementType.BOOL;
  }
}
