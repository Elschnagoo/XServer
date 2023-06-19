import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';

import Library from './Library';

@Entity('LibPath')
export default class LibPath extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  lib_path: string;

  @Column({
    dataType: 'boolean',
  })
  download: boolean;

  @EntityColumn(new Library())
  lib: string;

  constructor(props?: EProperties<LibPath>) {
    super();
    this.lib_path = props?.lib_path || '';
    this.lib = props?.lib || '';
    this.download = props?.download || false;
  }
}
