import { StatementService } from './../../services/statement.service';
import { HeaderService } from './../../services/header.service';
import { StorageService } from 'src/app/services/storage.service';
import { SnackbarService } from './../../services/snackbar.service';
import { FormInputs, PlanningRowData } from './../../model/planning.model';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { PatchType } from 'src/app/model/patch-type.model';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent {

  constructor(
    private snackbarService: SnackbarService,
    private storageService: StorageService,
    private headerService: HeaderService,
    private statementService: StatementService
  ) {
    this.headerService.title = 'Planejamento';
  }

  @ViewChild('firstContainer') firstContainer: ElementRef<HTMLDivElement> | null = null;
  @ViewChild('secondContainer') secondContainer: ElementRef<HTMLDivElement> | null = null;
  @ViewChild('thirdContainer') thirdContainer: ElementRef<HTMLDivElement> | null = null;

  rows: PlanningRowData[] = this.storageService.getPlanningRows() ?? [];
  haveEnoughBalance: boolean = false;
  valueDifference: number = 0;
  timeToBuyInMonths: number = 0;
  formInputs: FormInputs = {
    label: null,
    price: null
  }

  private _itemBeingViewed: PlanningRowData | null = null;
  
  get itemBeingViewed() {
    return this._itemBeingViewed;
  }

  set itemBeingViewed(item: PlanningRowData | null) {
    this._itemBeingViewed = item;

    if (item) {
      const tableRows = this.storageService.getTableRows();
      if (!tableRows) return;
      
      const statementBalance = this.statementService.totalBalance;
      const monthBalance = tableRows.reduce((prev, current) => current.value + prev, 0);
      this.haveEnoughBalance = statementBalance + monthBalance >= item.price;
      this.valueDifference = Math.abs(statementBalance + monthBalance - item.price);
    }
  }

  onCheckboxChange(id: string, checkStatus: boolean) {
    const findedRow = this.rows.find(row => row.id === id);
    if (!findedRow) return;

    const rowIndex = this.rows.indexOf(findedRow);
    const newRowData = { ...this.rows[rowIndex], isChecked: checkStatus };
    this.rows[rowIndex] = newRowData;

    this.storageService.patch(PatchType.PLANNING, this.rows);
  }

  onThirdContainerInputChange(event: any) {
    const inputValue = Number(event.target.value.replaceAll(',', '.'));
    if (!inputValue || !this.itemBeingViewed) return;
    
    const timeToBuyInMonths = Math.ceil(this.itemBeingViewed.price / inputValue);
    if (!isFinite(timeToBuyInMonths)) return;
    this.timeToBuyInMonths = timeToBuyInMonths;
  }

  addItem() {
    if (!this.formInputs.label || !this.formInputs.price) {
      this.snackbarService.showMessage('Preencha todos os campos!', true)
      return;
    }
    
    const formattedValue = Number(
      this.formInputs.price
        .toString()
        .replaceAll(',', '.')
    );

    if (!formattedValue) {
      this.snackbarService.showMessage('O valor inserido não é válido!', true);
      return;
    }

    const planningRow: PlanningRowData = {
      id: new Date().valueOf().toString(),
      isChecked: false,
      label: this.formInputs.label,
      price: formattedValue
    }

    this.rows.push(planningRow);
    this.storageService.patch(PatchType.PLANNING, this.rows);
    this.clearForm();
  }

  deleteRow(id: string) {
    const planningRows = this.storageService.deletePlanningRow(id);
    if (!planningRows) return;
    this.rows = planningRows;
  }

  openInformationsDialog(item: PlanningRowData) {
    this.itemBeingViewed = item;
  }

  onTabChanged(tabChangeEvent: MatTabChangeEvent) {
    const views = [this.firstContainer, this.secondContainer, this.thirdContainer];
    const tabIndex = tabChangeEvent.index;
    const viewToShow = views[tabIndex];

    views.forEach(view => view?.nativeElement.classList.add('hidden'));
    viewToShow?.nativeElement.classList.remove('hidden');
  }

  clearInformations() {
    this.valueDifference = 0;
    this.timeToBuyInMonths = 0;
    this.itemBeingViewed = null;
  }

  clearForm() {
    this.formInputs.label = null;
    this.formInputs.price = null;
  }
}
