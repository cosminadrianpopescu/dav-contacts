import * as util from 'util';

import { BaseTestUnit } from '../base';
import { NgInject, NgTest } from '../decorators';
import { Dav } from '../services/dav';
import {Store} from '../services/store';
import {MOCK_SERVER, MockRouter} from './mocks';
import {Plugins} from '@capacitor/core';
import {VCardParser} from '../lib/src';
import {Router} from '@angular/router';
import {ContactName} from '../pipes';
import {FAV_TAG} from '../models';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

export class DavTest extends BaseTestUnit {
  @NgInject(Dav) private _service: Dav;
  @NgInject(Store) private _store: Store;

  constructor() {
    super([Dav, Store, {provide: Router, useClass: MockRouter}]);
  }

  public static async add(service: Dav) {
    await service.addServer(MOCK_SERVER);
  }
  
  public static del() {
    Plugins.Storage['_map'] = new Map<string, any>();
  }

  @NgTest()
  protected async _testConnect() {
    await DavTest.add(this._service);
    // console.log('address is', this._service.addressBook.contacts[0]);
    // const contact = this._service.addressBook.contacts.find(c => {
    //   const m = c.metadata.find(m => m.vcardId == 'FN');
    //   return m.value == 'Lixa Popescu';
    // });
    // console.log('contact is', util.inspect(contact, {depth: null, colors: true, showHidden: true}));
    // const idx = contact.metadata.findIndex(m => m.vcardId == 'PHOTO');
    // contact.metadata.splice(idx, 1);
    // await this._service.update(contact);
    // console.log('parsing is', VCardParser.stringify(contact.metadata));
    // const a = await this._store.getAddressBook();
    // console.log('address is', a, util.inspect(a.contacts[0], {depth: null, colors: true, showHidden: true}));
    DavTest.del();
  }

  @NgTest()
  public async testSearchById() {
    await DavTest.add(this._service);
    const c = this._service.contactById('6f66c7cb7cef4cb8804044c6b8736c26');
    expect(c).toBeDefined();
    const pipe = new ContactName();
    expect(pipe.transform(c)).toEqual('Oana Carneanu');
    DavTest.del();
  }

  @NgTest()
  public async testSearchByTel() {
    await DavTest.add(this._service);
    let c = this._service.contactsByNumber('0489463787')[0];
    expect(c).toBeDefined();
    const pipe = new ContactName();
    expect(pipe.transform(c)).toEqual('Lixa Popescu');
    c = this._service.contactsByNumber('+32489463787')[0];
    expect(c).toBeDefined();
    expect(pipe.transform(c)).toEqual('Lixa Popescu');
    c = this._service.contactsByNumber('0032489463787')[0];
    expect(c).toBeDefined();
    expect(pipe.transform(c)).toEqual('Lixa Popescu');
    let contacts = this._service.contactsByNumber('00489463787');
    expect(contacts.length).toEqual(0);
    DavTest.del();
  }

  @NgTest()
  public async testFiltering() {
    await DavTest.add(this._service);
    let c = this._service.filterByPhoneNumber('4');
    console.log('c is', c);
    DavTest.del();
  }

  @NgTest()
  public async testTags() {
    await DavTest.add(this._service);
    const tags = this._service.getTags();
    console.log('tags are', tags);
    const contacts = this._service.contactsByTag('db');
    console.log('contacts are', contacts);
    DavTest.del();
  }

  @NgTest()
  public async testFavourites() {
    await DavTest.add(this._service);
    this._service['_server'] = MOCK_SERVER;
    let c = this._service.addressBook.contacts[0];
    expect(this._service.isFavorite(c)).toBeFalsy();
    c = this._service.contactsByNumber('0489463787')[0];
    console.log('is fav is', this._service.isFavorite(c));
    // await this._service.addTag(FAV_TAG);
    DavTest.del();
  }

  @NgTest()
  public async searchByPhone() {
    await DavTest.add(this._service);
    this._service['_server'] = MOCK_SERVER;
    const contacts = this._service.searchContactByPhone('489463');
    console.log('contacts are', contacts);
    DavTest.del();
  }
}
