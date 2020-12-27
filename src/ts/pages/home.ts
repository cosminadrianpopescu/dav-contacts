import {Component} from '@angular/core';
import {combineLatest, from} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {AddressBook, NO_TAG, SelectedTab, SwipeEvent} from '../models';
import {Dav} from '../services/dav';
import {Navigation} from '../services/navigation';
import {Sort} from '../services/sort';
import {Store} from '../services/store';

type Tab = {
  idx: number;
  init: boolean;
  which: SelectedTab;
}

@Component({
  selector: 'dav-home',
  templateUrl: '../../html/home.html',
  styleUrls: ['../../assets/scss/home.scss'],
})
export class Home  extends BaseComponent {
  public static lastTab: SelectedTab = null;
  @NgInject(Dav) private _dav: Dav;
  @NgInject(Store) private _store: Store;
  @NgInject(Sort) private _sort: Sort;
  @NgInject(Navigation) private _nav: Navigation;

  protected _book: AddressBook;
  protected _tags: Array<string>;
  protected _selectedTab: SelectedTab;
  protected _sync: number = 0;
  protected _loaded: boolean = false;
  protected _tabs: Array<Tab> = [];
  protected _tabsInit: Array<boolean> = new Array();
  protected _onlyOneTab: boolean = false;

  @NgCycle('init')
  protected async _initMe() {
    const obs = this._dav.ready$.pipe(
      tap(() => this._sort.sort()),
      switchMap(() => this._sort.sorted$),
    );

    this.connect(
      combineLatest(from(this._store.getVisibleTabs()), from(this._store.getDefaultTab()), obs), 
      async ([tabs, selectedTab]) => {
        await new Promise(resolve => setTimeout(resolve));
        this._setItems();
        this._loaded = true;
        this._tabs[0] = {init: false, which: SelectedTab.FAVORITES, idx: tabs.indexOf(SelectedTab.FAVORITES) == -1 ? -10 : 0};
        this._tabs[1] = {init: false, which: SelectedTab.CONTACTS, idx: tabs.indexOf(SelectedTab.CONTACTS) == -1 ? -10 : Math.max(this._tabs[0].idx + 1, 0)};
        this._tabs[2] = {init: false, which: SelectedTab.GROUPS, idx: tabs.indexOf(SelectedTab.GROUPS) == -1 ? -10 : Math.max(this._tabs[1].idx + 1, 1)};
        this._tab({index: Home.lastTab != null ? Home.lastTab : this._tabs.find(t => t.which == selectedTab).idx});
        this._onlyOneTab = tabs.length == 1;
      }
    );
  }

  private _setItems() {
    this._sync++;
    this._book = this._dav.addressBook;
    this._tags = this._dav.getTags();
    this._tags.push(NO_TAG);
  }

  protected async _click() {
    this._dav.sync();
  }

  protected _dial() {
    this.navigate('dial');
  }

  protected _tab(ev: {index: number}) {
    const t = this._tabs.find(t => t.idx == ev.index);
    this._selectedTab = ev.index;
    t.init = true;
    Home.lastTab = ev.index;
    this._nav.routeData$.next({withSearch: [SelectedTab.GROUPS, SelectedTab.CONTACTS].indexOf(ev.index) != -1, title: 'Contacts'});
  }

  protected _add() {
    this.navigate('details/new');
  }

  protected _swipe(ev: SwipeEvent) {
    let x = this._selectedTab + (ev == 'left' ? -1 : 1);
    if (x < 0) {
      x = 0;
    }
    const l = this._tabs.filter(t => t.idx >= 0).length;
    if (x >= l) {
      x = l - 1;
    }

    this._tab({index: x});
  }
}
