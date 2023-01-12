import { StorageService } from 'src/app/services/storage.service';
import { StatementRowData } from './../model/statement.model';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { PatchType } from '../model/patch-type.model';

@Injectable({ providedIn: 'root' })
export class StatementService {

  constructor(
    private storageService: StorageService,
  ) {}

  rows: BehaviorSubject<StatementRowData[]> = new BehaviorSubject(
    this.storageService.getStatementRows() ?? []
  );

  get totalBalance() {
    return this.rows.value.reduce((prev, current) =>
      prev + current.balance, 0
    );
  }

  addRow(data: StatementRowData) {
    const rows = this.rows.value;
    rows.push(data);

    this.storageService.patch(PatchType.STATEMENT, rows);
    this.rows.next(rows);
  }
}
