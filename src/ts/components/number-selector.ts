import {Component} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Contact, LabelValue} from '../models';
import {Dav} from '../services/dav';
import {Dialer} from '../services/dialer';

@Component({
  selector: 'dav-number-selector',
  templateUrl: '../../html/number-selector.html',
  styleUrls: ['../../assets/scss/number-selector.scss'],
})
export class NumberSelector extends BaseComponent {
  @NgInject(Dav) private _dav: Dav;
  @NgInject(Dialer) private _dialer: Dialer;

  protected _numbers: Array<LabelValue> = [];
  protected _selection: string = null;
  protected _visible: boolean = false;
  protected _model: string = null;
  private _contact: Contact;

  @NgCycle('init')
  protected _initMe() {
    this.connect(this._dialer.selectNumber$, c => {
      this._contact = c;
      this._visible = true;
      this._model = null;
      this._numbers = this._dav.contactPhones(this._contact).map(n => <LabelValue>{label: n, value: n});
    })
  }

  protected _select(number: string) {
    this._dialer.numberSelected$.emit(number);
    this._visible = false;
  }
}
