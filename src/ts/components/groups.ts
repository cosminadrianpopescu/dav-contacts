import {COMMA, ENTER, SPACE} from '@angular/cdk/keycodes';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {BaseInputWithMetadata} from '../base';
import {NgInject} from '../decorators';
import {CATEGORIES} from '../models';
import {Dav} from '../services/dav';

@Component({
  selector: 'dav-groups',
  templateUrl: '../../html/form.html',
  styleUrls: ['../../assets/scss/form.scss'],
})
export class Groups extends BaseInputWithMetadata {
  @NgInject(Dav) private _dav: Dav;
  protected _keys: Array<number> = [SPACE, ENTER, COMMA];

  constructor() {
    super();
    this.vcardId = CATEGORIES;
  }
  
  private _sync: boolean = false;
  @ViewChild('input', {static: false}) private _input: ElementRef;

  protected async _removed(tag: string) {
    await this._dav.removeTag(this.contact, tag, false);
    this._sync = !this._sync;
  }
  
  protected async _add() {
    const el: HTMLInputElement = this._input.nativeElement;
    if (el.value == '') {
      return ;
    }
    await this._dav.addContactTag(this.contact, el.value, false);
    el.value = '';
    this._sync = !this._sync;

    console.log('contact is now', this.contact);
  }
}
