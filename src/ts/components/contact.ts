import {Component, Input, ViewEncapsulation} from '@angular/core';
import {BaseComponent} from '../base';
import {Contact as Model} from '../models';
import {NgInject, NgCycle} from '../decorators';
import {Dav} from '../services/dav';
import {Store} from '../services/store';
import {Dialer} from '../services/dialer';

@Component({
  selector: 'dav-contact',
  templateUrl: '../../html/contact.html',
  styleUrls: ['../../assets/scss/contact.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Contact extends BaseComponent {
  @Input() public contact: Model;
  @NgInject(Dav) private _dav: Dav;
  @NgInject(Dialer) private _dialer: Dialer;
  @NgInject(Store) private _store: Store;

  protected _showFav: boolean = false;
  protected _showCall: boolean = false;

  @NgCycle('init')
  protected async _initMe() {
    const type = await this._store.getCallType();
    this._showCall = type != 'CALL';
    this._showFav = await this._store.getShowFav();
  }

  private _preventClick(ev: MouseEvent) {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    ev.preventDefault();
  }

  protected async _fav(ev: MouseEvent) {
    this._preventClick(ev);
    await this.showLoading();
    const callback = (this._dav.isFavorite(this.contact) ? this._dav.removeFavorite : this._dav.setFavorite).bind(this._dav);
    await callback(this.contact);
    await this.hideLoading();
  }

  protected _call() {
    this._dialer.dial(this.contact);
  }

  protected async _edit(ev: MouseEvent) {
    ev.stopImmediatePropagation();
    ev.stopPropagation();
    ev.preventDefault();
    this.navigate(`details/${this._dav.contactId(this.contact)}`);
  }
}
