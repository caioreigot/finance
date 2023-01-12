import { PlanningRowData } from './../model/planning.model';
import { StatementRowData } from './../model/statement.model';
import { TableRowData } from '../model/table.model';
import { AppStructure } from '../model/app-structure.model';
import { Injectable } from '@angular/core';
import { PatchType } from '../model/patch-type.model';

@Injectable({ providedIn: 'root' })
export class StorageService {

  private tableRowsKey = 'tableRows';
  private statementRowsKey = 'statementRows';
  private planningRowsKey = 'planningRows';

  getTableRows(): TableRowData[] | null {
    const storedString = localStorage.getItem(this.tableRowsKey);
    if (!storedString) return null;
    return JSON.parse(storedString);
  }

  getStatementRows(): StatementRowData[] | null {
    const storedString = localStorage.getItem(this.statementRowsKey);
    if (!storedString) return null;
    return JSON.parse(storedString);
  }

  getPlanningRows(): PlanningRowData[] | null {
    const storedString = localStorage.getItem(this.planningRowsKey);
    if (!storedString) return null;
    return JSON.parse(storedString);
  }

  getAll(): AppStructure | null {
    const tableRows = this.getTableRows();
    const statementRows = this.getStatementRows();
    const planningRows = this.getPlanningRows();
    
    if (!tableRows || !statementRows || !planningRows) return null;
    return { tableRows, statementRows, planningRows };
  }

  getTableRowById(id: string): TableRowData | null {
    const tableRows = this.getTableRows();
    return tableRows?.find(row => row.id === id) ?? null;
  }

  overrideTableRow(newRowData: TableRowData): boolean {
    const tableRows = this.getTableRows();
    if (!tableRows) return false;

    const findedRow = tableRows.find(row => row.id === newRowData.id);
    if (!findedRow) return false;

    newRowData.value = Number(newRowData.value);

    const rowToReplaceIndex = tableRows.indexOf(findedRow);
    tableRows[rowToReplaceIndex] = newRowData;
    this.patch(PatchType.TABLE, tableRows);
    return true;
  }

  /** @returns Novo array sem o item ou null caso o id não seja encontrado */
  deleteTableRow(id: string): TableRowData[] | null {
    const tableRows = this.getTableRows();
    if (!tableRows) return null;

    const tableArrayWithoutRow = tableRows.filter(row => row.id !== id);
    this.patch(PatchType.TABLE, tableArrayWithoutRow);
    return tableArrayWithoutRow;
  }

  /** @returns Novo array sem o item ou null caso o id não seja encontrado */
  deletePlanningRow(id: string): PlanningRowData[] | null {
    const planningRows = this.getPlanningRows();
    if (!planningRows) return null;

    const planningArrayWithoutRow = planningRows.filter(row => row.id !== id);
    this.patch(PatchType.PLANNING, planningArrayWithoutRow);
    return planningArrayWithoutRow;
  }

  put(data: AppStructure): void {
    localStorage.setItem(this.tableRowsKey, JSON.stringify(data.tableRows));
    localStorage.setItem(this.statementRowsKey, JSON.stringify(data.statementRows));
    localStorage.setItem(this.planningRowsKey, JSON.stringify(data.planningRows));
  }

  patch(
    patchType: PatchType,
    data: TableRowData[] | StatementRowData[] | PlanningRowData[]
  ): boolean {
    const appStructure = this.getAll();
    if (!appStructure) return false;

    switch(patchType) {
      case PatchType.TABLE:
        appStructure.tableRows = data as TableRowData[];
        break;
      case PatchType.STATEMENT:
        appStructure.statementRows = data as StatementRowData[];
        break;
      case PatchType.PLANNING:
        appStructure.planningRows = data as PlanningRowData[];
        break;
    }

    this.put(appStructure);
    return true;
  }
}