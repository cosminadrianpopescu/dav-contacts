import {Component, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
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
  @NgInject(MatDialog) private _modal: MatDialog;
  @ViewChild('confirm') private _confirmTpl: TemplateRef<any>;

  protected _newType: string = '';
  private _ref: MatDialogRef<any, any>;

  @NgCycle('init')
  protected _initMe() {
    this.types = this._dav.getMetadataTypes(this.metadata);
    this.types.push(CUSTOM);
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
    console.log('ev is', ev);
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
