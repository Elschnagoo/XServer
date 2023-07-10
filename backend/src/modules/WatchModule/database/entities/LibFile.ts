import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';
import Library from './Library';
import LibPath from './LibPath';
import { ProbeInfo } from '../../lib/MediaHandlerTypes';

@Entity('LibFile')
export default class LibFile extends CoreEntity {
  @EntityColumn(new LibPath())
  lib_path: string;

  @EntityColumn(new Library())
  lib: string;

  @Column({
    dataType: 'string',
    unique: true,
  })
  file_path: string;

  @Column({
    dataType: 'json',
    canBeNull: true,
  })
  file_meta: ProbeInfo | null;

  @Column({
    dataType: 'int',
    canBeNull: true,
  })
  duration: number | null;

  @Column({
    dataType: 'boolean',
  })
  synced: boolean;

  constructor(props?: EProperties<LibFile>) {
    super();
    this.lib = props?.lib || '';
    this.lib_path = props?.lib_path || '';
    this.file_meta = props?.file_meta ?? null;
    this.file_path = props?.file_path || '';
    this.synced = props?.synced ?? false;
    this.duration = props?.duration ?? null;
  }
}
