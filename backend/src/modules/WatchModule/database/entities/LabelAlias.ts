import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';
import Label from './Label';

@Entity('LabelAlias')
export default class LabelAlias extends CoreEntity {
  @EntityColumn(new Label())
  label: string;

  @Column({
    dataType: 'string',
  })
  alias: string;

  constructor(props?: EProperties<LabelAlias>) {
    super();
    this.label = props?.label || '';
    this.alias = props?.alias || '';
  }
}
