import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HeaderService {

  private _title: BehaviorSubject<string> = new BehaviorSubject('');

  get title(): string {
    return this._title.value;
  }

  set title(value: string) {
    this._title.next(value);
  }
}
