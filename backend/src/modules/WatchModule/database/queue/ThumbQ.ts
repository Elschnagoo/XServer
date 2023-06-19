import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';
import StateTypeQ, { StateTypeQEnum } from './StateTypeQ';
import Library from '../entities/Library';

@Entity('ScannerQ')
export default class ScannerQ extends CoreEntity {
  @EntityColumn(new Library())
  lib: string;

  @EntityColumn(new StateTypeQ())
  state: StateTypeQEnum;

  @Column({
    dataType: 'date',
  })
  created: Date;

  @Column({
    dataType: 'json',
  })
  error: any | null;

  constructor(prop?: EProperties<ScannerQ>) {
    super();
    this.state = prop?.state || StateTypeQEnum.PENDING;
    this.created = prop?.created || new Date();
    this.error = prop?.error || null;
    this.lib = prop?.lib || '';
  }
}
