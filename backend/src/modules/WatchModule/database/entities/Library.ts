import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';
import LibType, { LibTypeEnum } from './LibType';

@Entity('Library')
export default class Library extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  lib_name: string;

  @EntityColumn(new LibType())
  lib_type: LibTypeEnum;

  constructor(props?: EProperties<Library>) {
    super();
    this.lib_name = props?.lib_name || '';
    this.lib_type = props?.lib_type || LibTypeEnum.MOVIE;
  }
}
