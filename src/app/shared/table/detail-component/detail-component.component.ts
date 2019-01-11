import { TableDef } from '../../../common.types';

export interface DetailComponent {
  setData(row: any, tableDef: TableDef);
  refresh(row: any);
  getParentClass();
}
