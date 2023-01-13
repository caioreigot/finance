import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderService } from './../../services/header.service';
import { BalanceService } from './../../services/balance.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementComponent } from './statement.component';
import { By } from '@angular/platform-browser';

describe('StatementComponent (Extrato)', () => {
  let component: StatementComponent;
  let fixture: ComponentFixture<StatementComponent>;
  let headerService: HeaderService;
  let balanceService: BalanceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatementComponent ],
      imports: [ MatSnackBarModule ],
      providers: [ BalanceService, HeaderService ]
    })
    .compileComponents();

    headerService = TestBed.inject(HeaderService);
    balanceService = TestBed.inject(BalanceService);

    fixture = TestBed.createComponent(StatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alterar o título do header para "extrato"', () => {
    expect(headerService.title.toLowerCase()).toBe('extrato');
  });

  it('deve mostrar o total da soma de todos os valores da tabela', () => {
    balanceService.statementRows.next([
      { date: '01/2023', balance: 100 },
      { date: '02/2023', balance: 50 },
      { date: '03/2023', balance: 50 },
    ]);

    fixture.detectChanges();

    // Pega o elemento HTML que mostra o saldo total da tabela
    const totalBalanceElement = fixture.debugElement
      .query(By.css('#total-balance')).nativeElement;
    
    expect(totalBalanceElement.innerText).toBe('R$200.00');
  });
});
