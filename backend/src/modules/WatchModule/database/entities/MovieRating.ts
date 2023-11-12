import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';
import MovieLib from './MovieLib';
import RatingElement from './RatingElement';

@Entity('MovieRating')
export default class MovieRating extends CoreEntity {
  @EntityColumn(new RatingElement())
  element: string;

  @EntityColumn(new MovieLib())
  movie: string;

  @Column({
    dataType: 'int',
  })
  rating_value: number;

  constructor(props?: EProperties<MovieRating>) {
    super();
    this.element = props?.element || '';
    this.movie = props?.movie || '';
    this.rating_value = props?.rating_value ?? 0;
  }
}
