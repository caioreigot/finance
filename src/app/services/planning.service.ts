import { SnackbarService } from './snackbar.service';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlanningFormInputs, PlanningRowData } from '../model/planning.model';
import { PatchType } from '../model/patch-type.model';

@Injectable({ providedIn: 'root' })
export class PlanningService {
  
  constructor(
    private storageService: StorageService,
    private snackbarService: SnackbarService
  ) {}

  private _rows: BehaviorSubject<PlanningRowData[]> = new BehaviorSubject(
    this.storageService.getPlanningRows() ?? []
  )

  get rows() {
    return this._rows.value;
  }

  set rows(rows: PlanningRowData[]) {
    this._rows.next(rows);
  }

  onCheckboxChange(id: string, checkStatus: boolean) {
    const findedRow = this.rows.find(row => row.id === id);
    if (!findedRow) return;

    const rowIndex = this.rows.indexOf(findedRow);
    const newRowData = { ...this.rows[rowIndex], isChecked: checkStatus };
    this.rows[rowIndex] = newRowData;

    this.storageService.patch(PatchType.PLANNING, this.rows);
  }

  addRow(inputs: PlanningFormInputs) {
    if (!inputs.label || !inputs.price) {
      this.snackbarService.showMessage('Preencha todos os campos!', true)
      return;
    }

    const formattedValue = Number(
      inputs.price
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
      label: inputs.label,
      price: formattedValue
    }

    this.rows.push(planningRow);
    this.storageService.patch(PatchType.PLANNING, this.rows);
  }

  deleteRow(id: string) {
    const planningRows = this.storageService.deletePlanningRow(id);
    if (!planningRows) return;
    this.rows = planningRows;
  }
}