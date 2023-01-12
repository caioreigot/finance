import { PlanningRowData } from './planning.model';
import { StatementRowData } from './statement.model';
import { TableRowData } from './table.model';

export interface AppStructure {
  tableRows: TableRowData[];
  statementRows: StatementRowData[];
  planningRows: PlanningRowData[];
}