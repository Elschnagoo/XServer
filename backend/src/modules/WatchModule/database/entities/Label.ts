import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/kernel';

@Entity('Label')
export default class Label extends CoreEntity {
  @Column({
    dataType: 'string',
    unique: true,
  })
  label_name: string;

  @Column({
    dataType: 'int',
  })
  label_order: number;

  @Column({
    dataType: 'string',
    canBeNull: true,
  })
  icon: string | null;

  @Column({
    dataType: 'string',
    canBeNull: true,
  })
  color: string | null;

  constructor(props?: EProperties<Label>) {
    super();
    this.label_name = props?.label_name || '';
    this.icon = props?.icon ?? null;
    this.color = props?.color ?? null;
    this.label_order = props?.label_order ?? 0;
  }
}
