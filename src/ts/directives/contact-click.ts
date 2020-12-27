import {Directive, HostListener, Input} from '@angular/core';
import {BaseComponent} from '../base';
import {NgInject} from '../decorators';
import {ClickAction, Contact} from '../models';
import {Dialer} from '../services/dialer';

@Directive({
  selector: '[dav-contact-click]',
})
export class ContactClick extends BaseComponent {
  @Input('dav-contact-click') public type: ClickAction;
  @Input() public who: string | Contact;

  @NgInject(Dialer) private _dialer: Dialer;

  @HostListener('click', ['$event'])
  protected async _onClick(ev: MouseEvent) {
    this._dialer.processClick(this.who, ev, this.type);
  }
}
