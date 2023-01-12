import { HeaderService } from './../../services/header.service';
import { StatementService } from './../../services/statement.service';
import { MONTHS } from '../../model/months.model';
import { SnackbarService } from './../../services/snackbar.service';
import { StorageService } from 'src/app/services/storage.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormInputs, TableRowData } from '../../model/table.model';
import { BehaviorSubject } from 'rxjs';
import { PatchType } from '../../model/patch-type.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  constructor(
    private snackbarService: SnackbarService,
    private storageService: StorageService,
    private statementService: StatementService,
    private headerService: HeaderService
  ) {
    this.headerService.title = 'Tabela';
  }

  formInputs: FormInputs = {
    descriptive: null,
    value: null
  }

  rowDataEditDialog: TableRowData = {
    id: '',
    descriptive: '',
    value: 0
  }

  rows: BehaviorSubject<TableRowData[]> = new BehaviorSubject(
    this.storageService.getTableRows() ?? []
  );
  
  @ViewChild('editRowModal')
  editRowModal: ElementRef | null = null;
  
  currentMonth = MONTHS[new Date().getMonth()];
  monthBalance = 0;
  totalBalance = 0;

  ngOnInit(): void {
    this.rows.subscribe(rows => {
      const monthBalance = rows.reduce((prev, current) =>
        current.value + prev, 0
      );
      
      // Quando uma nova linha for adicionada à tabela, atualiza o saldo do mês
      this.monthBalance = monthBalance;

      // Quando uma nova linha for adicionada à tabela, atualiza o saldo total
      this.totalBalance = monthBalance + this.statementService.totalBalance;
    });

    // Sempre que o extrato for atualizado, atualiza o balanço total também
    this.statementService.rows.subscribe(() => {
      this.totalBalance = this.monthBalance + this.statementService.totalBalance;;
    });

    if (this.didMonthTurn()) {
      this.clearTableAndSaveBalanceOnStatement();
    }
  }

  didMonthTurn(): boolean {
    const tableRows = this.storageService.getTableRows();
    if (!tableRows || !tableRows[0]) return false;

    const firstRowDateId = Number(tableRows[0].id);
    const firstRowMonth = new Date(firstRowDateId).getMonth();
    const currentMonth = new Date().getMonth();
    return firstRowMonth !== currentMonth;
  }

  clearTableAndSaveBalanceOnStatement() {
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentMonthFormatted = currentMonth.toString().padStart(2, '0');
    const currentMonthYear = `${currentMonthFormatted}/${date.getFullYear()}`;
    const monthBalance = this.monthBalance;
    this.rows.next([]);
    this.storageService.patch(PatchType.TABLE, []);
    this.statementService.addRow({ 
      date: currentMonthYear,
      balance: monthBalance
    });
  }

  deleteRow(id: string) {
    const tableRows = this.storageService.deleteTableRow(id);
    if (!tableRows) return;
    this.rows.next(tableRows);
  }

  onSubmit() {
    if (!this.formInputs.descriptive || !this.formInputs.value) {
      this.snackbarService.showMessage('Preencha todos os campos!', true);
      return;
    }

    const formattedValue = Number(
      this.formInputs.value
        .toString()
        .replaceAll(',', '.')
    );

    if (!formattedValue) {
      this.snackbarService.showMessage('O valor inserido não é válido!', true);
      return;
    }

    const rows = this.rows.value;
    
    rows.push({
      id: new Date().valueOf().toString(),
      descriptive: this.formInputs.descriptive,
      value: formattedValue
    });

    this.rows.next(rows);
    this.storageService.patch(PatchType.TABLE, this.rows.value);
    this.snackbarService.showMessage('Linha inserida com sucesso!');
    this.clearForm();
    
    return false;
  }

  clearForm() {
    this.formInputs.descriptive = null;
    this.formInputs.value = null;
  }

  showEditModal = () => this.editRowModal?.nativeElement.classList.remove('hidden');
  closeEditModal = () => this.editRowModal?.nativeElement.classList.add('hidden');

  setupAndShowEditDialog(id: string) {
    const rowToEdit = this.storageService.getTableRowById(id);
    
    if (!rowToEdit) {
      this.snackbarService.showMessage('Erro ao tentar editar linha...', true);
      return;
    }

    this.rowDataEditDialog.id = id;
    this.rowDataEditDialog.descriptive = rowToEdit.descriptive;
    this.rowDataEditDialog.value = rowToEdit.value;
    
    this.showEditModal();
  }

  saveEditedRow() {
    if (this.storageService.overrideTableRow(this.rowDataEditDialog)) {
      const tableRows = this.storageService.getTableRows();
      if (!tableRows) {
        this.snackbarService.showMessage('Ocorreu um erro inesperado!'), true;
        return;
      }
      
      this.rows.next(tableRows);
      this.snackbarService.showMessage('Linha editada com sucesso!');
      this.closeEditModal();
    }
  }
}
