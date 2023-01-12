import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  
  constructor(private snackbar: MatSnackBar) {}

  showMessage(msg: string, isError: boolean = false): void {
    this.snackbar.open(msg, 'x', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: isError ? ['error'] : ['success']
    });
  }
}