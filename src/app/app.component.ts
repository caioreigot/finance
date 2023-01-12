import { HeaderService } from './services/header.service';
import { SnackbarService } from './services/snackbar.service';
import { AppStructure } from './model/app-structure.model';
import { StorageService } from 'src/app/services/storage.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  constructor(
    private storageService: StorageService,
    private snackbarService: SnackbarService,
    private headerService: HeaderService
  ) {}

  @ViewChild('downloadAnchor') 
  downloadAnchor: ElementRef<HTMLAnchorElement> | null = null;

  @ViewChild('fileInput')
  fileInput: ElementRef<HTMLInputElement> | null = null;
  
  get title(): string {
    return this.headerService.title;
  }

  ngOnInit(): void {
    this.createAppStructureIfDoesntExists();
  }

  onChooseFile(event: any) {
    const input: HTMLInputElement = event.target;
    
    if (!input.files || !input.files.length) {
      this.snackbarService.showMessage('Nenhum arquivo foi selecionado!', true);
      return;
    }

    input.files[0].text()
      .then(json => {
        const parsedJson = JSON.parse(json);
        
        if (
          !parsedJson.tableRows ||
          !parsedJson.statementRows ||
          !parsedJson.planningRows
        ) {
          this.snackbarService.showMessage(
            'O arquivo não é válido!', true
          );
          
          return;
        }
        
        this.storageService.put(parsedJson);
        alert('Dados importados com sucesso! A página será recarregada.');
        location.reload();
      })
      .catch(error => {
        this.snackbarService.showMessage(
          'Erro ao tentar ler arquivo!', true
        );
        
        console.error(error);
      })
  }

  createAppStructureIfDoesntExists() {
    if (this.storageService.getAll() === null) {
      const appSructure: AppStructure = {
        tableRows: [],
        statementRows: [],
        planningRows: []
      }
      
      this.storageService.put(appSructure);
    }
  }

  downloadAppStructure() {
    const fileName = 'Dados do Finance';
    const fileType = 'application/json';
  
    const json = JSON.stringify(this.storageService.getAll() ?? []);
    const blob = new Blob([json], { type: fileType });

    const anchor = this.downloadAnchor?.nativeElement;
    
    if (!anchor) {
      this.snackbarService.showMessage('Ocorreu um erro inesperado!', true);
      return;
    }
  
    anchor.download = fileName;
  
    if (
      window.navigator 
      && (window.navigator as any).msSaveOrOpenBlob 
      && !window.navigator.userAgent.indexOf('Edge/')
    ) {
      anchor.onclick = function() { (window.navigator as any).msSaveOrOpenBlob(blob, fileName) };
    } else {
      // Usar (window.webkitURL || window.URL).createObjectURL(blob) caso precise suportar webKitURL.
      anchor.href = window.URL.createObjectURL(blob);
      (anchor.dataset as any).downloadUrl = [fileType, anchor.download, anchor.href].join(':');
      anchor.click();
    }
  }

  requestUploadFile() {
    this.fileInput?.nativeElement.click();
  }
}