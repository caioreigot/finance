import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PlanningRowData } from './../../model/planning.model';
import { PatchType } from './../../model/patch-type.model';
import { StorageService } from './../../services/storage.service';
import { PlanningService } from './../../services/planning.service';
import { SnackbarService } from './../../services/snackbar.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningComponent } from './planning.component';
import { HeaderService } from 'src/app/services/header.service';

describe('PlanningComponent (Planejamento)', () => {
  let component: PlanningComponent;
  let rendered: HTMLElement;
  let fixture: ComponentFixture<PlanningComponent>;

  let headerService: HeaderService;
  let snackbarService: SnackbarService;
  let planningService: PlanningService;
  let storageService: StorageService;

  let addButton: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanningComponent ],
      imports: [
        MatSnackBarModule,
        FormsModule,
        MatCheckboxModule,
        MatIconModule
      ],
      providers: [
        HeaderService,
        SnackbarService,
        PlanningService
      ]
    })
    .compileComponents();

    headerService = TestBed.inject(HeaderService);
    snackbarService = TestBed.inject(SnackbarService);
    planningService = TestBed.inject(PlanningService);
    storageService = TestBed.inject(StorageService);

    fixture = TestBed.createComponent(PlanningComponent);
    rendered = fixture.debugElement.nativeElement;
    addButton = rendered.querySelector('#add-button') as HTMLButtonElement;

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alterar o título do header para "Planejamento"', () => {
    expect(headerService.title).toBe('Planejamento');
  });

  it('deve exibir uma mensagem de erro ao tentar inserir dados sem preencher os inputs', () => {
    const showMessageSpy = spyOn(snackbarService, 'showMessage');

    addButton.click();
    expect(showMessageSpy).toHaveBeenCalledOnceWith(jasmine.any(String), true);
  });

  it('deve adicionar a nova linha ao array rows e persistir os dados usando o StorageService', () => {
    const patchSpy = spyOn(storageService, 'patch');
    const rowsLengthBeforeAdding = planningService.rows.length;

    component.formInputs = {
      label: 'Teste',
      price: 1
    };

    addButton.click();

    const rowsLengthAfterAdding = planningService.rows.length;
    expect(rowsLengthAfterAdding).toBe(rowsLengthBeforeAdding + 1);
    expect(patchSpy).toHaveBeenCalledOnceWith(PatchType.PLANNING, jasmine.any(Array<PlanningRowData>));
  });

  it('deve adicionar a nova linha ao rows e persistir os dados usando o StorageService', () => {
    expect(headerService.title).toBe('Planejamento');
  });

  it('deve renderizar corretamente no HTML da tabela o item inserido', () => {
    planningService.rows = [{ id: '1', isChecked: false, label: 'Teste', price: 1 }];
    fixture.detectChanges();
    
    const checklistItemLabel = rendered.querySelector('.checklist-container > div:first-child label span') as HTMLElement;
    expect(checklistItemLabel.innerText).toBe('Teste');
  });
});
