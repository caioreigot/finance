import { Injectable } from '@angular/core';
import { SnackbarService } from './snackbar.service';
import { TableRowData } from './../model/table.model';
import { StorageService } from 'src/app/services/storage.service';
import { StatementRowData } from './../model/statement.model';
import { BehaviorSubject } from 'rxjs';
import { PatchType } from '../model/patch-type.model';

@Injectable({ providedIn: 'root' })
export class BalanceService {

  constructor(
    private storageService: StorageService,
    private snackbarService: SnackbarService
  ) {}

  tableRows: BehaviorSubject<TableRowData[]> = new BehaviorSubject(
    this.storageService.getTableRows() ?? []
  );

  statementRows: BehaviorSubject<StatementRowData[]> = new BehaviorSubject(
    this.storageService.getStatementRows() ?? []
  );

  get monthBalance() {
    return this.tableRows.value.reduce((prev, current) =>
      prev + current.value, 0
    );
  }

  get statementBalance() {
    return this.statementRows.value.reduce((prev, current) =>
      prev + current.balance, 0
    );
  }

  clearTableAndSaveBalanceOnStatement() {
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentMonthFormatted = currentMonth.toString().padStart(2, '0');
    const currentMonthYear = `${currentMonthFormatted}/${date.getFullYear()}`;

    this.storageService.patch(PatchType.TABLE, []);
    this.addStatementRow({ 
      date: currentMonthYear,
      balance: this.monthBalance
    });

    this.tableRows.next([]);
  }

  addTableRow(row: TableRowData) {
    const rows = this.tableRows.value;
    rows.push(row);

    this.storageService.patch(PatchType.TABLE, rows);
    this.tableRows.next(rows);
  }

  overrideTableRow(newRowData: TableRowData) {
    if (this.storageService.overrideTableRow(newRowData)) {
      const tableRows = this.storageService.getTableRows();
      
      if (!tableRows) {
        this.snackbarService.showMessage('Ocorreu um erro inesperado!', true);
        return;
      }
      
      this.tableRows.next(tableRows);
      this.snackbarService.showMessage('Linha editada com sucesso!');
    }
  }

  deleteTableRow(id: string) {
    const tableRows = this.storageService.deleteTableRow(id);
    if (!tableRows) return;
    this.tableRows.next(tableRows);
  }

  didMonthTurn(): boolean {
    const tableRows = this.tableRows.value;
    if (!tableRows || !tableRows[0]) return false;

    const firstRowDateId = Number(tableRows[0].id);
    const firstRowMonth = new Date(firstRowDateId).getMonth();
    const currentMonth = new Date().getMonth();

    return firstRowMonth !== currentMonth;
  }

  addStatementRow(data: StatementRowData) {
    const rows = this.statementRows.value;
    rows.push(data);

    this.storageService.patch(PatchType.STATEMENT, rows);
    this.statementRows.next(rows);
  }
}
