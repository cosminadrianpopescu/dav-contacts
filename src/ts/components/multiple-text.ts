import {Component} from '@angular/core';
import {BaseMultipleText} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Dav} from '../services/dav';

const CUSTOM = 'Custom';
type T = {value: string, type: string}

@Component({
  selector: 'dav-multiple-text',
  templateUrl: '../../html/form.html',
  styleUrls: ['../../assets/scss/form.scss'],
})
export class MultipleText extends BaseMultipleText {
  @NgInject(Dav) private _dav: Dav;

  protected _newType: string = '';
  protected _confirm: T = null;

  @NgCycle('init')
  protected _initMe() {
    this.types = this._dav.getMetadataTypes(this.metadata);
    this.types.push(CUSTOM);
  }

  protected _doAdd() {
    if (this._newType == '') {
      return ;
    }

    this._changeType(this._newType, this._confirm);
    this.metadata.values = [].concat(this.metadata.values);
    this._confirm = null;
  }

  protected _changeType(ev: string, value: T) {
    if (ev != CUSTOM) {
      value.type = ev;
      return ;
    }

    this._confirm = value;
  }

  protected _add() {
    this.metadata.values.push({type: null, value: ''});
  }

  protected _remove(which: T) {
    this.metadata.values = this.metadata.values.filter(v => v != which);
  }
}
