import { TableRowData } from './../../model/table.model';
import { MatIconModule } from '@angular/material/icon';
import { HeaderService } from './../../services/header.service';
import { StorageService } from './../../services/storage.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from './../../services/snackbar.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BalanceService } from 'src/app/services/balance.service';
import { PatchType } from 'src/app/model/patch-type.model';

describe('TableComponent (Tabela)', () => {
  let component: TableComponent;
  let rendered: HTMLElement;
  let fixture: ComponentFixture<TableComponent>;
  
  let balanceService: BalanceService;
  let storageService: StorageService;
  let headerService: HeaderService;
  let snackbarService: SnackbarService;

  let submitButton: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableComponent ],
      imports: [
        BrowserAnimationsModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatCardModule,
        FormsModule,
        MatInputModule,
        MatIconModule
      ],
      providers: [ 
        SnackbarService,
        BalanceService,
        StorageService,
        HeaderService
      ]
    })
    .compileComponents();

    balanceService = TestBed.inject(BalanceService);
    storageService = TestBed.inject(StorageService);
    headerService = TestBed.inject(HeaderService);
    snackbarService = TestBed.inject(SnackbarService);

    fixture = TestBed.createComponent(TableComponent);
    rendered = fixture.debugElement.nativeElement;
    submitButton = rendered.querySelector('.form-submit-button[type="submit"]') as HTMLButtonElement;

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alterar o título do header para "Tabela"', () => {
    expect(headerService.title).toBe('Tabela');
  });

  it('deve exibir uma mensagem de erro ao tentar inserir dados sem preencher os inputs', () => {
    const showMessageSpy = spyOn(snackbarService, 'showMessage');

    submitButton.click();
    expect(showMessageSpy).toHaveBeenCalledOnceWith(jasmine.any(String), true);
  });

  it('deve chamar TableComponent.onSubmit ao clicar no botão inserir com os inputs preenchidos', () => {
    const onSubmitSpy = spyOn(component, 'onSubmit');

    component.formInputs = {
      descriptive: 'Teste',
      value: 1
    };

    submitButton.click();
    expect(onSubmitSpy).toHaveBeenCalled();
  });

  it('deve adicionar a nova linha ao array tableRows e persistir os dados usando o StorageService', () => {
    const tableRows = balanceService.tableRows;
    const currentTableRowsSize = tableRows.value.length;
    const tableRowsSpy = spyOn(tableRows, 'next').and.callThrough();
    const addTableRowSpy = spyOn(balanceService, 'addTableRow').and.callThrough();
    const storagePatchSpy = spyOn(storageService, 'patch');

    component.formInputs = {
      descriptive: 'Teste',
      value: 1
    };

    submitButton.click();

    expect(addTableRowSpy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ descriptive: 'Teste', value: 1 }));
    expect(tableRowsSpy).toHaveBeenCalledOnceWith(jasmine.any(Array<TableRowData>));
    expect(tableRows.value.length).toBe(currentTableRowsSize + 1);
    expect(storagePatchSpy).toHaveBeenCalledOnceWith(PatchType.TABLE, jasmine.any(Array<TableRowData>));
  });

  it('deve renderizar corretamente no HTML da tabela os valores inseridos', () => {
    balanceService.tableRows.next([{ id: '1', descriptive: 'Teste', value: 1 }]);
    fixture.detectChanges();
    
    const descriptiveTableData = rendered.querySelector('table > tr:nth-of-type(2) > td:nth-of-type(1)') as HTMLElement;
    const valueTableData = rendered.querySelector('table > tr:nth-of-type(2) > td:nth-of-type(2)') as HTMLElement;

    expect(descriptiveTableData.innerText).toBe('Teste');
    expect(valueTableData.innerText).toContain('1.00');
  });
});