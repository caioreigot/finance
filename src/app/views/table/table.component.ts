import { BalanceService } from './../../services/balance.service';
import { HeaderService } from './../../services/header.service';
import { MONTHS } from '../../model/months.model';
import { SnackbarService } from './../../services/snackbar.service';
import { StorageService } from 'src/app/services/storage.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormInputs, TableRowData } from '../../model/table.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {

  constructor(
    public balanceService: BalanceService,
    private snackbarService: SnackbarService,
    private storageService: StorageService,
    private headerService: HeaderService
  ) {
    this.headerService.title = 'Tabela';

    if (this.balanceService.didMonthTurn()) {
      this.balanceService.clearTableAndSaveBalanceOnStatement();
    }
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
  
  @ViewChild('editRowModal')
  editRowModal: ElementRef | null = null;
  
  currentMonth = MONTHS[new Date().getMonth()];

  get rows() {
    return this.balanceService.tableRows.value;
  }

  get monthBalance() {
    return this.balanceService.monthBalance;
  }

  get totalBalance() {
    return this.balanceService.statementBalance + this.monthBalance;
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

    this.balanceService.addTableRow({
      id: new Date().valueOf().toString(),
      descriptive: this.formInputs.descriptive,
      value: formattedValue
    });

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
      this.snackbarService.showMessage('Erro ao tentar encontrar linha...', true);
      return;
    }

    this.rowDataEditDialog.id = id;
    this.rowDataEditDialog.descriptive = rowToEdit.descriptive;
    this.rowDataEditDialog.value = rowToEdit.value;
    
    this.showEditModal();
  }

  saveEditedRow() {
    this.balanceService.overrideTableRow(this.rowDataEditDialog);
    this.closeEditModal();
  }
}
