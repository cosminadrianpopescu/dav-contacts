import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Contact} from '../models';
import {Dav} from '../services/dav';

@Component({
  selector: 'dav-number-selector',
  templateUrl: '../../html/number-selector.html',
  styleUrls: ['../../assets/scss/number-selector.scss'],
})
export class NumberSelector extends BaseComponent {
  @NgInject(Dav) private _dav: Dav;
  @Output() public notify: EventEmitter<string> = new EventEmitter<string>();

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private _contact: Contact) {
    super();
  }

  protected _numbers: Array<string> = [];
  protected _selection: string = null;

  @NgCycle('init')
  protected _initMe() {
    this._numbers = this._dav.contactPhones(this._contact);
  }

  protected _select(number: string) {
    this.notify.emit(number);
  }
}
