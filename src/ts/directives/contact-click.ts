import {Directive, HostListener, Input} from '@angular/core';
import {BaseComponent} from '../base';
import {NgInject} from '../decorators';
import {ClickAction, Contact} from '../models';
import {Dav} from '../services/dav';
import {Dialer} from '../services/dialer';
import {Store} from '../services/store';

@Directive({
  selector: '[dav-contact-click]',
})
export class ContactClick extends BaseComponent {
  @Input('dav-contact-click') public type: ClickAction;
  @Input() public who: string | Contact;

  @NgInject(Store) private _store: Store;
  @NgInject(Dialer) private _dialer: Dialer;
  @NgInject(Dav) private _dav: Dav;

  @HostListener('click', ['$event'])
  protected async _onClick(ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    let type = this.type
    if (!type) {
      type = await this._store.getAction();
    }

    if (type == 'call' && this.who) {
      this._dialer.dial(this.who);
    }
    else if (['view', 'edit'].indexOf(type) != -1 && this.who && this.who instanceof Contact) {
      const id = this._dav.contactId(this.who);
      this.navigate(`details/${type == 'edit' ? 'edit/' : ''}${id}`);
    }
  }
}
