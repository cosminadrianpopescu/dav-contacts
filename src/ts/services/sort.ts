import {EventEmitter, Injectable} from '@angular/core';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';
import {Contact, History as HistoryModel} from '../models';
import {Dav} from './dav';
import {Store} from './store';
import {History} from './history';

@Injectable()
export class Sort extends BaseClass {
  @NgInject(Dav) private _dav: Dav;
  @NgInject(Store) private _store: Store;
  @NgInject(History) private _history: History;

  public sorted$ = new EventEmitter();

  constructor() {
    super();
    this._dav.synced$.subscribe(async () => {
      this.sort();
    });
  }

  private _getImportance(uid: string, items: Array<HistoryModel>): number{
    return items.filter(i => i.uid == uid)
      .reduce((acc, v) => acc + v.count, 0);
  }

  public async contactsByImportance(): Promise<Array<Contact>>{
    let history = this._history.items;
    if (history.length == 0) {
      history = await this._history.load();
    }

    const d = new Date();
    // Only check the history for the last month
    history = history.filter(h => d.getTime() - h.date.getTime() <= 60 * 1000 * 60 * 24 * 30);

    const uids = Array.from(new Set(history.filter(h => h.uid).map(h => h.uid)));
    const map: Map<string, number> = new Map<string, number>();

    uids.forEach(u => map.set(u, this._getImportance(u, history)));
    return Array.from(map.keys())
      .sort((a, b) => map.get(b) - map.get(a))
      .map(k => this._dav.contactById(k));
  }

  public async sort() {
    if (!this._dav.addressBook) {
      return ;
    }
    const field = await this._store.getSortOrder();
    const order = 'asc';

    const getName = (c: Contact) => {
      const m = c.metadata.find(m => m.vcardId == 'N');
      if (!m || field == 'full-name' || field == 'call-count') {
        return this._dav.getContactName(c);
      }

      if (field == 'first-name') {
        return <string>(m.values[1] || '') + <string>(m.values[0] || '') + <string>(m.values[2] || '');
      }

      if (field == 'last-name') {
        return <string>(m.values[0] || '') + <string>(m.values[1] || '') + <string>(m.values[2] || '');
      }
    }

    this._dav.addressBook.contacts.sort((a, b) => {
      let n1: string = getName(order == 'asc' ? a : b);
      let n2: string = getName(order == 'asc' ? b : a);

      return n1.toLocaleLowerCase() < n2.toLocaleLowerCase() ? -1 : 1;
    });

    this.sorted$.emit();
  }
}
