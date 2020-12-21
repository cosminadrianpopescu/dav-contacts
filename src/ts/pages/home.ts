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
  protected _tabs: Array<boolean> = [];
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
        this._tabs[0] = tabs.indexOf(SelectedTab.FAVORITES) != -1;
        this._tabs[1] = tabs.indexOf(SelectedTab.CONTACTS) != -1;
        this._tabs[2] = tabs.indexOf(SelectedTab.GROUPS) != -1;
        this._selectedTab = Home.lastTab != null ? Home.lastTab : selectedTab;
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
    Home.lastTab = ev.index;
    this._nav.routeData$.next({withSearch: [SelectedTab.GROUPS, SelectedTab.CONTACTS].indexOf(ev.index) != -1, title: 'Contacts'});
  }

  protected _add() {
    this.navigate('details/new');
  }

  protected _swipe(ev: SwipeEvent) {
    this._selectedTab += (ev == 'left' ? -1 : 1);
    if (this._selectedTab < 0) {
      this._selectedTab = 0;
    }
    if (this._selectedTab >= this._tabs.length) {
      this._selectedTab = this._tabs.length - 1;
    }
  }
}
