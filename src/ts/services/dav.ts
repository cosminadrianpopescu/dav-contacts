import {EventEmitter, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as dav from 'dav';
import {ReplaySubject} from 'rxjs';
import {BaseClass} from '../base';
import {AddressBookConverter, VCardConverter} from '../convertors';
import {NgInject} from '../decorators';
import {VCardMetadata, VCardStructuredProperty, VCardParser} from '../lib/src';
import {AddressBook, CATEGORIES, Contact, FAV_TAG, FilteringResult, ModelFactory, Server, TEL, CallType} from '../models';
import {Store} from './store';

@Injectable()
export class Dav extends BaseClass {
  @NgInject(Store) private _store: Store;
  @NgInject(Router) private _router: Router;
  public ready$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  public synced$: EventEmitter<any> = new EventEmitter<any>();
  private _server: Server;
  public addressBook: AddressBook;
  private _xhr: dav.transport.Basic;

  constructor() {
    super();
    this.init();
  }

  public static toVcard(metadata: Array<VCardMetadata>): string {
    const converter = new VCardConverter();
    return converter.convert(metadata);
  }

  private _account(loadObjects: boolean = true): Promise<dav.Account> {
    if (!this._xhr) {
      this._xhr = new dav.transport.Basic(<any>{
        username: this._server.user,
        password: this._server.pass,
      });
    }
    return dav.createAccount({
      server: this._server.url,
      xhr: this._xhr,
      accountType: 'carddav',
      loadObjects: loadObjects,
    });

  }

  public async sync() {
    const account = await this._account();
    const conv = new AddressBookConverter();
    this.addressBook = conv.convert(account.addressBooks[0]);
    this.addressBook.contacts.forEach(c => {
      c.metadata.sort((a, b) => a.priority - b.priority);
      c.metadata.forEach(m => {
        if (Array.isArray(m.value)) {
          m.value.sort((a, b) => a.priority - b.priority);
        }

        const values: Array<VCardStructuredProperty> = m.values as Array<VCardStructuredProperty> || [];
        values.forEach(v => {
          if (Array.isArray(v.value)) {
            v.value.sort((a, b) => a.priority - b.priority);
          }
        })
      });
    });
    await this._store.setAddressBook(this.addressBook);
    this.synced$.emit();
  }

  public async init() {
    this._server = await this._store.getServer();
    if (!this._server) {
      this._router.navigateByUrl('settings');
      return ;
    }
    this.addressBook = await this._store.getAddressBook();
    if (!this.addressBook) {
      await this.sync();
    }
    this.ready$.next(true);
  }

  private async _getVcardByUrl(url: string): Promise<dav.VCard> {
    const account = await this._account();
    const result = account.addressBooks[0].objects.find(o => o.url == url);
    if (!result) {
      throw new Error('UNKNOWN_CONTACT');
    }

    return result;
  }

  public async update(c: Contact) {
    const _c = this.contactById(this.contactId(c));
    const idx = this.addressBook.contacts.indexOf(_c);
    this.addressBook.contacts[idx] = c;
    c.metadata = c.metadata.filter(m => {
      const type = VCardParser.getType(m.vcardId);
      console.log('type is', type, 'for', m);
      if (type == 'structured') {
        return Array.isArray(m.value) && m.value.length > 0;
      }

      if (['multiple-text', 'structured-multiple'].indexOf(type) != -1) {
        return Array.isArray(m.values) && m.values.length > 0;
      }

      if (['single-binary', 'single-input', 'single-choice', 'tags'].indexOf(type) != -1) {
        return m.value;
      }

      return false;
    });

    const contact = await this._getVcardByUrl(c.url);
    contact.addressData = Dav.toVcard(c.metadata);
    await dav.updateCard(contact, {xhr: this._xhr});
    await this._store.setAddressBook(this.addressBook);
  }

  public async delete(c: Contact) {
    const contact = await this._getVcardByUrl(c.url);
    await dav.deleteCard(contact, {xhr: this._xhr});
    const _c = this.contactById(this.contactId(c));
    const idx = this.addressBook.contacts.indexOf(_c);
    if (idx != -1) {
      this.addressBook.contacts.splice(idx, 1);
    }
    await this._store.setAddressBook(this.addressBook);
  }

  public async add(metadata: Array<VCardMetadata>): Promise<string> {
    const account = await this._account();
    const id = Dav.UUID();
    let m = metadata.find(m => m.vcardId == 'UID');
    if (!m) {
      metadata.push({vcardId: 'UID', value: id});
    }

    m = metadata.find(m => m.vcardId == 'VERSION');
    if (!m) {
      metadata.push({vcardId: 'VERSION', value: '3.0'});
    }
    await dav.createCard(account.addressBooks[0], {
      data: Dav.toVcard(metadata), filename: `${id}`, xhr: this._xhr,
    });

    return id;
  }

  public async addServer(s: Server) {
    this._xhr = null;
    await this._store.setServer(s);
    this._server = s;
    await this.sync();
    this.ready$.next(true);
  }

  public getContactName(c: Contact): string {
    let m = c.metadata
      .filter(m => ['FN', 'FULLNAME', 'N'].indexOf(m.vcardId) != -1)
      .sort((a, b) => a.priority - b.priority)
      .reduce((acc, v) => acc ? acc : v, null);

    if (!m) {
      return '';
    }
    
    if (['FN', 'FULLNAME'].indexOf(m.vcardId) != -1) {
      return m.value as string;
    }

    return (m.value as VCardStructuredProperty[])
      .map(v => v)
      .sort((a, b) => a.priority - b.priority)
      .reduce((acc, v) => acc + (acc == '' ? '' : ' ') + (v.value || ''), '');
  }

  public contactById(id: string): Contact {
    if (!this.addressBook) {
      return null;
    }
    return this.addressBook.contacts.find(c => this.contactId(c) == id);
  }

  public static areSameNumbers(n1: string, n2: string): boolean {
    const p1 = /^(\+|00)[0-9]{2}/g;
    const p2 = /^0([1-9])/;

    return n1.replace(p1, '').replace(p2, '$1').replace(/ /g, '') == n2.replace(p1, '').replace(p2, '$1').replace(/ /g, '');
  }

  public contactsByNumber(number: string): Array<Contact> {
    if (!this.addressBook) {
      return null;
    }

    return this.addressBook.contacts.filter(c => {
      const m = c.metadata.find(m => m.vcardId == 'TEL');
      if (!m) return undefined;

      return m.values.find(v => Dav.areSameNumbers(number, v.value as string));
    });
  }

  public contactPhones(c: Contact): Array<string> {
    if (!c) {
      return [];
    }
    const m = c.metadata.find(m => m.vcardId == 'TEL');
    if (!m) {
      return [];
    }

    return m.values.map(v => v.value as string);
  }

  public getContactIntent(c: Contact): CallType {
    const m = c.metadata.find(m => m.vcardId == 'X-CUSTOM-INTENT');

    return m ? m.value as CallType : null;
  }

  public contactNumberByNumber(c: Contact, number: string): Array<string> {
    return this.contactPhones(c).filter(n => Dav.areSameNumbers(n, number));
  }

  public contactId(c: Contact): string  {
    return c.url.replace(/^.*\/([^\/\.]+)(\.vcf)?$/g, '$1');
  }

  public filterByPhoneNumber(number: string): Array<FilteringResult> {
    if (!this.addressBook || !number) {
      return [];
    }
    
    const getPhone = (c: Contact): string => this.contactPhones(c).find(p => p.indexOf(number) != -1);

    return this.addressBook.contacts.filter(c => {
      const phone = getPhone(c);
      return phone ? true : false;
    }).map(c => {
      return ModelFactory.instance(<FilteringResult>{contact: c, match: getPhone(c)}, FilteringResult) as FilteringResult;
    })
  }

  public getTags(): Array<string> {
    if (!this.addressBook) {
      return [];
    }

    const tags = this.addressBook.contacts
      .filter(c => c.metadata.find(m => m.vcardId == CATEGORIES && m.value))
      .map(c => (c.metadata.find(m => m.vcardId == CATEGORIES).value as string).split(','))
      .reduce((acc, v) => acc.concat(v), []);

    return Array.from(new Set(tags)).sort((a, b) => {
      if (a == FAV_TAG) {
        return -1;
      }
      if (b == FAV_TAG) {
        return 1;
      }
      return a < b ? -1 : 1;
    });
  }

  public getContactTags(c: Contact): Array<string> {
    if (!c) {
      return [];
    }
    const m = c.metadata.find(m => m.vcardId == CATEGORIES);
    if (!m || !m.value) {
      return [];
    }

    return Array.from(new Set((m.value as string).split(',')));
  }

  public contactsByTag(tag: string): Array<Contact> {
    if (!this.addressBook) {
      return [];
    }

    return this.addressBook.contacts
      .filter(c => {
        const m = c.metadata.find(m => m.vcardId == CATEGORIES);
        if (!m && !tag) {
          return true;
        }

        if (!m) {
          return false;
        }

        return (m.value as string).split(',').indexOf(tag) != -1;
      });
  }

  public async addTag(tag: string) {
    const m: Array<VCardMetadata> = [
      {vcardId: 'X-ADDRESSBOOKSERVER-KIND', value: 'GROUP'}, 
      {vcardId: 'VERSION', value: '3.0'}, 
      {vcardId: 'FN', value: tag}, 
    ];

    await this.add(m);
  }

  public isFavorite(c: Contact): boolean {
    const m = c.metadata.find(m => m.vcardId == CATEGORIES);
    if (!m) {
      return false;
    }

    return (m.value as string).split(',').indexOf(FAV_TAG) != -1;
  }

  public async setFavorite(c: Contact) {
    await this.addContactTag(c, FAV_TAG);
  }

  private _searchMetadata(c: Contact, mId: string): VCardMetadata {
    let m = c.metadata.find(m => m.vcardId == mId);
    if (!m) {
      m = new VCardMetadata();
      m.vcardId = mId;
      m.value = '';
      c.metadata.push(m);
    }

    return m;
  }

  private _doAddContactTag(c: Contact, tag: string): boolean {
    let result = false;
    let m = this._searchMetadata(c, CATEGORIES);

    if ((m.value as string).split(',').indexOf(tag) == -1) {
      m.value += (m.value == '' ? '' : ',') + tag;
      result = true;
    }

    return result;
  }
  
  public async addContactTag(c: Contact, tag: string, sync: boolean = true) {
    const result = this._doAddContactTag(c, tag);
    if (result && sync) {
      await this.update(c);
      await this.sync();
    }
  }

  public setContactTags(c: Contact, tags: Array<string>) {
    let m = this._searchMetadata(c, CATEGORIES);
    m.value = tags.join(',');
  }

  private async _doRemoveTag(c: Contact, tag: string): Promise<boolean> {
    const m = c.metadata.find(m => m.vcardId == CATEGORIES);
    if (!m || !(m.value as string)) {
      return false;
    }

    const initCount = m.value.length;
    m.value = (m.value as string).split(',').filter(v => v != tag).join(',');

    if (!m.value) {
      c.metadata = c.metadata.filter(m => m.vcardId != CATEGORIES);
    }

    return m.value.length != initCount;
  }

  public async removeTag(c: Contact, tag: string, sync: boolean = true) {
    const result = await this._doRemoveTag(c, tag);
    if (result && sync) {
      await this.update(c);
      await this.sync();
    }
  }

  public async removeFavorite(c: Contact) {
    await this.removeTag(c, FAV_TAG);
  }

  public searchContactByPhone(number: string): Array<Contact> {
    if (!this.addressBook) {
      return [];
    }

    return this.addressBook.contacts.filter(c => {
      const m = c.metadata.find(m => m.vcardId == 'TEL');
      if (!m) {
        return false;
      }

      return m.values.map(v => (v.value as string)).filter(n => Dav.areSameNumbers(n, number)).length > 0;
    });
  }

  public avatarColor(c: Contact): string {
    const name = this.getContactName(c);
    let hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    let h = hash % 360;
    return 'hsl('+h+', 50%, 50%)';
  }

  public getMetadataTypes(m: VCardMetadata): Array<string> {
    if (!m) {
      return [];
    }

    const types = this.addressBook.contacts
      .map(c => c.metadata)
      .reduce((acc, v) => acc.concat(v), [])
      .filter(_m => _m.vcardId == m.vcardId)
      .map(m => m.values)
      .reduce((acc, v) => acc.concat(v), [])
      .filter(v => v.type)
      .map(v => v.type)
      .filter(t => !!t);

    return Array.from(new Set(types));
  }

  public setContactNumber(c: Contact, number: string) {
    let m = c.metadata.find(m => m.vcardId == TEL);
    if (m) {
      m.value = number;
      return ;
    }

    m = VCardParser.newMetadata(TEL);
    m.values.push({value: number});
    c.metadata.push(m);
  }
}
