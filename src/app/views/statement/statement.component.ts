import { StatementRowData } from './../../model/statement.model';
import { HeaderService } from './../../services/header.service';
import { StatementService } from '../../services/statement.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.css']
})
export class StatementComponent {

  rows = this.statementService.rows.value;
  total = this.statementService.totalBalance;
  
  constructor(
    private statementService: StatementService,
    private headerService: HeaderService
  ) {
    this.headerService.title = 'Extrato';
  }
}
