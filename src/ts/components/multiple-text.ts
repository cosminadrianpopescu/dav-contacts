import {BaseMultipleText} from '../base';
import {Component, ViewEncapsulation, ViewChild, TemplateRef} from '@angular/core';
import {NgCycle, NgInject} from '../decorators';
import {Dav} from '../services/dav';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

const CUSTOM = 'Custom';
const REMOVE = 'Remove';
type T = {value: string, type: string}

@Component({
  selector: 'dav-multiple-text',
  templateUrl: '../../html/form.html',
  styleUrls: ['../../assets/scss/form.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MultipleText extends BaseMultipleText {
  @NgInject(Dav) private _dav: Dav;
  @NgInject(MatDialog) private _modal: MatDialog;
  @ViewChild('confirm') private _confirmTpl: TemplateRef<any>;

  protected _newType: string = '';
  private _ref: MatDialogRef<any, any>;

  @NgCycle('init')
  protected _initMe() {
    this.types = this._dav.getMetadataTypes(this.metadata);
    this.types.push(CUSTOM);
    this.types.push(REMOVE);
  }

  protected _doAdd(value: T) {
    this._ref.close();
    if (this._newType == '') {
      return ;
    }

    this.types.push(this._newType);
    this.types = [].concat(this.types);
    this._changeType(this._newType, value);
    this.metadata.values = [].concat(this.metadata.values);
  }

  protected _changeType(ev: string, value: T) {
    if (ev == REMOVE) {
      this._remove(value);
      return ;
    }
    if (ev != CUSTOM) {
      value.type = ev;
      return ;
    }

    this._ref = this._modal.open(this._confirmTpl, {data: value});
  }

  protected _add() {
    this.metadata.values.push({type: null, value: ''});
  }

  protected _remove(which: T) {
    this.metadata.values = this.metadata.values.filter(v => v != which);
  }
}
