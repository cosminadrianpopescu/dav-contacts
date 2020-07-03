import {Component, ViewChild} from '@angular/core';
import {BaseComponent} from '../base';
import {Dialpad} from '../components/dialpad';
import {NgInject} from '../decorators';
import {Contact, FilteringEvent, History as HistoryModel} from '../models';
import {Dav} from '../services/dav';
import {Dialer as DialerService} from '../services/dialer';
import {Navigation} from '../services/navigation';

@Component({
  selector: 'dav-dialer',
  templateUrl: '../../html/dialer.html',
  styleUrls: ['../../assets/scss/dialer.scss'],
})
export class Dialer extends BaseComponent {
  @NgInject(Dav) private _dav: Dav;
  @NgInject(DialerService) private _dialer: DialerService;
  @NgInject(Navigation) private _nav: Navigation;
  @ViewChild('dialpad', {static: false}) private _dialpad: Dialpad;
  protected _number: string = '';
  protected _displayDialpad: boolean = true;

  constructor() {
    super();
    this.connect(this._nav.routeData$, data => this._displayDialpad = data['no-dialpad'] != true);
  }

  protected _dial(number: string) {
    this._dialer.dial(number);
  }

  private _edit(number: string, c: Contact) {
    if (!c) {
      this._dialpad.text = number;
      return ;
    }
    const numbers = this._dav.contactNumberByNumber(c, number);
    const n = numbers.length >= 1 ? numbers[0] : null;
    this._dialpad.text = n || number;
  }

  protected _historyEv(ev: FilteringEvent) {
    if (ev.type == 'save') {
      this.navigate(`details/add/${(<HistoryModel>ev.item).number}`)
    }
    const contact = this._dialer.contactFromEvent(ev);
    if (ev.type == 'edit') {
      this._displayDialpad = true;
      setTimeout(() => this._edit((ev.item as HistoryModel).number, contact));
    }
  }

  protected async _contactsEv(ev: FilteringEvent) {
    if (ev.type == 'edit') {
      const c = ev.item as Contact;
      const number = await this._dialer.getNumber(c);
      this._edit(number, c);
    }
  }

  protected _numberChanged(number: string) {
    this._number = number;
  }
}
