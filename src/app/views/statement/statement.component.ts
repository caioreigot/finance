import { HeaderService } from './../../services/header.service';
import { BalanceService } from '../../services/balance.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.css']
})
export class StatementComponent {

  constructor(
    private balanceService: BalanceService,
    private headerService: HeaderService
  ) {
    this.headerService.title = 'Extrato';
  }
  
  get rows() {
    return this.balanceService.statementRows.value;
  }

  get total() {
    return this.balanceService.statementBalance;
  }
}
