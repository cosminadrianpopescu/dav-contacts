import {Component} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Contact, ModelFactory, ShownField, TEL} from '../models';
import {Dav} from '../services/dav';
import {Navigation} from '../services/navigation';
import {Store} from '../services/store';

@Component({
  selector: 'dav-details',
  templateUrl: '../../html/details.html',
  styleUrls: ['../../assets/scss/details.scss'],
})
export class Details extends BaseComponent {
  @NgInject(Navigation) private _nav: Navigation;
  @NgInject(Dav) private _dav: Dav;
  @NgInject(Store) private _store: Store;

  private _contact: Contact;
  protected _readOnly = true;
  protected _fields: Array<ShownField> = [];
  private _id: string;
  protected _confirmDel: boolean = false;
  protected _isNew: boolean = false;

  private async _setFields(ro: boolean) {
    this._readOnly = ro;
    this._fields = await this._store.getShownFields();
    if (!this._readOnly) {
      return ;
    }

    this._fields = Store.contactROCards(this._contact, this._fields);
  }

  @NgCycle('init')
  protected async _initMe() {
    this.connect(this._nav.connectToRoute('contactId'), id => {
      this._id = id;
      this._initContact();

      if (this._router.url.match(/edit/)) {
        this._setFields(false);
      }
    });

    this.connect(this._nav.connectToRoute('new-number'), n => {
      const m = this._contact.metadata.find(m => m.vcardId == TEL);
      if (!m) {
        return ;
      }

      m.values.push({type: null, value: n});
    });

    this.connect(this._nav.connectToRoute('number'), number => this._initContact(number));
  }

  private _initContact(number?: string) {
    let c = this._dav.contactById(this._id);
    if (!c) {
      c = ModelFactory.instance(<Contact>{metadata: []}, Contact) as Contact;
      this._isNew = true;
      this._setFields(false);
    }
    else {
      this._setFields(true);
    }
    this._contact = ModelFactory.instance(JSON.parse(JSON.stringify(c)), Contact) as Contact;
    if (number) {
      this._dav.setContactNumber(this._contact, number);
    }
  }

  protected _edit() {
    this._setFields(false);
  }

  protected _cancel() {
    if (this._isNew) {
      this.navigate('');
      return ;
    }
    this._setFields(true);
    this._initContact();
  }

  protected async _save() {
    await this.showLoading();
    if (this._isNew) {
      const id = await this._dav.add(this._contact.metadata);
      await this._dav.sync();
      await this.hideLoading();
      this.navigate(`details/${id}`);
      return ;
    }
    await this._dav.update(this._contact);
    await this.hideLoading();
    this._setFields(true);
  }

  protected async _doDelete() {
    this._confirmDel = false;
    await this.showLoading();
    await this._dav.delete(this._contact);
    await this.hideLoading();
    this.navigate('');
  }

  protected _delete() {
    this._confirmDel = true;
  }
}
