import { Column, CoreEntity, Entity } from '@grandlinex/kernel';

export enum StateTypeQEnum {
  'PENDING' = 'PENDING',
  'RUNNING' = 'RUNNING',
  'ERROR' = 'ERROR',
  'DONE' = 'DONE',
}

@Entity('StateTypeQ')
export default class StateTypeQ extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  type_name: StateTypeQEnum;

  constructor(prop?: StateTypeQEnum) {
    super(prop);
    this.type_name = prop || StateTypeQEnum.PENDING;
  }
}
