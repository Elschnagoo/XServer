import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';
import Library from './Library';
import LibFile from './LibFile';

@Entity('MovieLib')
export default class MovieLib extends CoreEntity {
  @EntityColumn(new Library())
  lib: string;

  @Column({
    dataType: 'string',
  })
  movie_name: string;

  @Column({
    dataType: 'text',
    canBeNull: true,
  })
  movie_description: string | null;

  @Column({
    dataType: 'int',
    canBeNull: true,
  })
  rating: number | null;

  @Column({
    dataType: 'date',
  })
  created: Date;

  @Column({
    dataType: 'boolean',
  })
  synced: boolean;

  @Column({
    dataType: 'boolean',
  })
  disabled: boolean;

  @EntityColumn(new LibFile())
  lib_file: string;

  constructor(props?: EProperties<MovieLib>) {
    super();
    this.lib = props?.lib || '';
    this.movie_name = props?.movie_name || '';
    this.movie_description = props?.movie_description ?? null;
    this.created = props?.created || new Date();
    this.synced = props?.synced ?? false;
    this.disabled = props?.disabled ?? false;
    this.lib_file = props?.lib_file || '';
    this.rating = props?.rating ?? null;
  }
}
