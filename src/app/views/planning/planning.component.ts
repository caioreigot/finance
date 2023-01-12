import { BalanceService } from '../../services/balance.service';
import { HeaderService } from '../../services/header.service';
import { PlanningFormInputs, PlanningRowData } from '../../model/planning.model';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlanningService } from '../../services/planning.service';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent {

  constructor(
    private planningService: PlanningService,
    private headerService: HeaderService,
    private balanceService: BalanceService
  ) {
    this.headerService.title = 'Planejamento';
  }

  @ViewChild('firstContainer') firstContainer: ElementRef<HTMLDivElement> | null = null;
  @ViewChild('secondContainer') secondContainer: ElementRef<HTMLDivElement> | null = null;
  @ViewChild('thirdContainer') thirdContainer: ElementRef<HTMLDivElement> | null = null;

  haveEnoughBalance: boolean = false;
  valueDifference: number = 0;
  timeToBuyInMonths: number = 0;
  formInputs: PlanningFormInputs = {
    label: null,
    price: null
  }

  private _itemBeingViewed: PlanningRowData | null = null;

  get rows() {
    return this.planningService.rows;
  }

  set rows(rows: PlanningRowData[]) {
    this.planningService.rows = rows;
  }
  
  get itemBeingViewed() {
    return this._itemBeingViewed;
  }

  get totalBalance() {
    return this.balanceService.monthBalance + this.balanceService.statementBalance;
  }

  set itemBeingViewed(item: PlanningRowData | null) {
    this._itemBeingViewed = item;

    if (item) {
      this.haveEnoughBalance = this.totalBalance >= item.price;
      this.valueDifference = Math.abs(this.totalBalance - item.price);
    }
  }

  onCheckboxChange(id: string, checkStatus: boolean) {
    this.planningService.onCheckboxChange(id, checkStatus);
  }

  onThirdContainerInputChange(event: any) {
    const inputValue = Number(event.target.value.replaceAll(',', '.'));
    if (!inputValue || !this.itemBeingViewed) return;

    const timeToBuyInMonths = Math.ceil(
      (this.itemBeingViewed.price - this.totalBalance) / inputValue);
    
    if (!isFinite(timeToBuyInMonths)) return;
    this.timeToBuyInMonths = timeToBuyInMonths;
  }

  addRow() {
    this.planningService.addRow(this.formInputs);
    this.clearForm();
  }

  deleteRow(id: string) {
    this.planningService.deleteRow(id);
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
