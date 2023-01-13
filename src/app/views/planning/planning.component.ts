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
    public planningService: PlanningService,
    private balanceService: BalanceService,
    private headerService: HeaderService
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

  openInformationsDialog(item: PlanningRowData) {
    /* O dialog das informações abre quando itemBeingViewed é diferente de null
    (o que indica que há um item sendo visualizado) */
    this.itemBeingViewed = item;
  }

  // Ao trocar as abas no Informations Dialog, troca o conteúdo para o corresponde
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
