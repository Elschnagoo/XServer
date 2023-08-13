import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/kernel';
import StateTypeQ, { StateTypeQEnum } from './StateTypeQ';
import LibPath from '../entities/LibPath';

@Entity('DownloadQ')
export default class DownloadQ extends CoreEntity {
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

  @Column({
    dataType: 'string',
  })
  download_path: string;

  @EntityColumn(new LibPath())
  lib_path: string;

  @Column({
    dataType: 'json',
    canBeNull: true,
  })
  label: string[] | null;

  constructor(prop?: EProperties<DownloadQ>) {
    super();
    this.state = prop?.state || StateTypeQEnum.PENDING;
    this.created = prop?.created || new Date();
    this.error = prop?.error || null;
    this.download_path = prop?.download_path || '';
    this.lib_path = prop?.lib_path || '';
    this.label = prop?.label || null;
  }
}
