import { Injectable } from '@angular/core';
import { BaseClass } from '../base';
import {History as CallHistory, Contact, NumberDialed, CallLogType} from '../models';
import {NgInject} from '../decorators';
import {Store} from './store';
import {Dav} from './dav';
import {Dialer} from './dialer';
import {CallLog} from '@ionic-native/call-log/ngx';
import {Platform} from '@ionic/angular';
import {CallLog2History} from '../convertors/call-log-to-history';

@Injectable()
export class History extends BaseClass {
  @NgInject(Store) private _store: Store;
  @NgInject(Dav) private _dav: Dav;
  @NgInject(CallLog2History) private _convertor: CallLog2History;
  @NgInject(Dialer) private _dialer: Dialer;
  @NgInject(CallLog) private _callLog: CallLog;
  @NgInject(Platform) private _platform: Platform;

  private _items: Array<CallHistory> = [];

  public get items(): Array<CallHistory> {
    return [].concat(this._items);
  }

  constructor() {
    super();
    this._dialer.numberDialed$.subscribe((ev: NumberDialed) => this.add(ev.number, ev.contact));
    this._getPermissions();
  }

  private async _getPermissions(): Promise<boolean> {
    if (!this._platform.is('android')) {
      return ;
    }

    const result = await this._callLog.hasReadPermission();
    if (result) {
      return true;
    }
    const ask = await this._callLog.requestReadPermission();
    if (ask) {
      return true;
    }
    return false;
  }


  private _areSame(h1: CallHistory, h2: CallHistory): boolean {
    if (!h1 || !h2) {
      return false;
    }

    if (h1.uid == h2.uid && h1.uid) {
      return true;
    }

    return Dav.areSameNumbers(h1.number, h2.number);
  }

  public async add(number: string, contact?: Contact, d?: Date) {
    let uid: string
    if (!contact) {
      const contacts = this._dav.contactsByNumber(number);
      if (contacts.length == 1) {
        contact = contacts[0];
      }
    }
    if (contact) {
      uid = this._dav.contactId(contact);
    }

    const h = new CallHistory();
    h.uid = uid;
    h.type = CallLogType.LOCAL_HISTORY;
    h.number = number;
    h.count = 1;
    h.date = d || (new Date());
    let history = await this._store.getHistory();
    if (!Array.isArray(history)) {
      history = [];
    }
    const first = history.length > 0 ? history[0] : null;
    if (first && this._areSame(h, first)) {
      first.count ++;
      first.date = h.date;
      first.uid = h.uid;
      first.number = h.number;
    }
    else {
      history.push(h);
    }
    history.sort((a, b) => b.date.getTime() - a.date.getTime())
    const limit = await this._store.getHistoryItemsCount();
    if (history.length > limit) {
      history.splice(limit);
    }
    await this._store.setHistory(history);
  }

  public async load(): Promise<Array<CallHistory>> {
    let local = await this._store.getHistory();
    if (!Array.isArray(local)) {
      local = [];
    }
    if (!this._platform.is('android')) {
      return local;
    }

    const permissions = this._callLog.hasReadPermission();
    if (!permissions) {
      return local;
    }

    let log = await this._callLog.getCallLog([]);
    if (!Array.isArray(log)) {
      log = [];
    }
    this._items = this._convertor.convertAll(log).concat(local).sort((a, b) => b.date.getTime() - a.date.getTime());
    return this.items;
  }

  public label(h: CallHistory): string {
    const result = (s: string): string => `${s}${h.count > 1 ? ' (' + h.count + ')': ''}`
    if (!h.uid) {
      return result(h.number);
    }

    const c = this._dav.contactById(h.uid);
    if (c) {
      return result(this._dav.getContactName(c));
    }

    return result(h.number);
  }
}
