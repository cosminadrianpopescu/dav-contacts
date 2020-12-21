import { Injectable, Type } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { BaseClass } from '../base';
import {ModelFactory, Server, AddressBook, ClickAction, CallType, SelectedTab, SortType, ShownField} from '../models';
import {History} from '../models';
import {VCardParser} from '../lib/src';

const { Storage } = Plugins;
const SERVER_KEY = 'server';
const BOOK_KEY = 'address-book';
const HISTORY_KEY = 'call-history';
const ACTION_KEY = 'click-action';
const CALL_TYPE_KEY = 'call-type';
const HISTORY_ITEMS_KEY = 'history-items';
const DEFAULT_TAB_KEY = 'default-tab';
const SORT_KEY = 'sort-order';
const FAV_KEY = 'show-fav';
const FIELDS_KEY = 'shown-fields';
const VISIBLE_TABS_KEY = 'visible-tabs';

@Injectable()
export class Store extends BaseClass {
  public async load<T>(key: string, type: Type<T>, defValue?: T | Array<T>): Promise<T | Array<T>> {
    const result = await Storage.get({key: key});
    if (!result.value) {
      return typeof(defValue) != 'undefined' ? defValue : null;
    }
    const x = new type();
    if (x instanceof String || x instanceof Number || x instanceof Boolean) {
      return JSON.parse(result.value).data;
    }
    return ModelFactory.instance(JSON.parse(result.value).data, type);
  }

  public async save(key: string, data: any): Promise<void> {
    Storage.set({key: key, value: JSON.stringify({data: data, date: new Date()})});
  }

  public async getServer(): Promise<Server> {
    return this.load(SERVER_KEY, Server) as Promise<Server>;
  }

  public async setServer(value: Server): Promise<void> {
    return this.save(SERVER_KEY, value);
  }

  public async del(key: string): Promise<void> {
    await Storage.remove({key: key});
  }

  public async getAddressBook(): Promise<AddressBook> {
    return this.load(BOOK_KEY, AddressBook) as Promise<AddressBook>;
  }

  public async setAddressBook(value: AddressBook): Promise<void> {
    return this.save(BOOK_KEY, value);
  }

  public async getHistory(): Promise<Array<History>> {
    return this.load(HISTORY_KEY, History) as Promise<Array<History>>;
  }

  public async setHistory(h: Array<History>): Promise<void> {
    return this.save(HISTORY_KEY, h);
  }

  public async getAction(): Promise<ClickAction> {
    return this.load(ACTION_KEY, String, 'call') as Promise<ClickAction>;
  }

  public async setAction(a: ClickAction): Promise<void> {
    return this.save(ACTION_KEY, a);
  }

  public async getCallType(): Promise<CallType> {
    return this.load(CALL_TYPE_KEY, String, 'DIAL') as Promise<CallType>;
  }

  public async setCallType(type: CallType) {
    return this.save(CALL_TYPE_KEY, type);
  }

  public async getHistoryItemsCount(): Promise<number> {
    return this.load(HISTORY_ITEMS_KEY, Number, 100) as Promise<number>;
  }

  public async setHistoryItemsCount(count: number) {
    return this.save(HISTORY_ITEMS_KEY, count);
  }

  public async getDefaultTab(): Promise<SelectedTab> {
    return this.load(DEFAULT_TAB_KEY, Number, SelectedTab.FAVORITES) as Promise<SelectedTab>;
  }

  public async setDefaultTab(value: SelectedTab): Promise<void> {
    return this.save(DEFAULT_TAB_KEY, value);
  }

  public async getSortOrder(): Promise<SortType> {
    return this.load(SORT_KEY, String, 'call-count') as Promise<SortType>;
  }

  public async setSortOrder(value: SortType) {
    return this.save(SORT_KEY, value);
  }

  public async getShowFav(): Promise<boolean> {
    return this.load(FAV_KEY, Boolean, false) as Promise<boolean>;
  }

  public async setShowFav(value: boolean) {
    return this.save(FAV_KEY, value);
  }

  public async getShownFields(): Promise<Array<ShownField>> {
    const result = await this.load(FIELDS_KEY, String, 
      // ["N", "TEL", "CATEGORIES", "BDAY", "NICKNAME", "NOTE", "TITLE", "TZ", "RELATIONSHIP", "ORG", "GENDER", "LANG", "EMAIL", "IMPP", "URL", "RELATED", "ADR"]
      ["N", "TEL", "CATEGORIES"]
    ) ;

    return (result as Array<string>).map(s => <ShownField>{vcardId: s, type: VCardParser.getType(s)});
  }

  public async setShownFields(fields: Array<string>) {
    return this.save(FIELDS_KEY, fields);
  }

  public async getVisibleTabs(): Promise<Array<SelectedTab>> {
    const result = await this.load(VISIBLE_TABS_KEY, Number, [SelectedTab.FAVORITES, SelectedTab.GROUPS, SelectedTab.CONTACTS]) as Array<SelectedTab>;
    return result.map(x => parseInt(x.toString()));
  }

  public async setVisibleTabs(value: Array<SelectedTab>) {
    return this.save(VISIBLE_TABS_KEY, value);
  }
}
