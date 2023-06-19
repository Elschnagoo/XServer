import {
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';
import Label from '../entities/Label';
import MovieLib from '../entities/MovieLib';

@Entity('LabelMap')
export default class LabelMap extends CoreEntity {
  @EntityColumn(new Label())
  label: string;

  @EntityColumn(new MovieLib())
  mov_lib: string;

  constructor(props?: EProperties<LabelMap>) {
    super();
    this.label = props?.label || '';
    this.mov_lib = props?.mov_lib || '';
  }
}
