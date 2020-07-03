import {Component, ViewEncapsulation} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {AddressBook, NO_TAG, SelectedTab, SwipeEvent} from '../models';
import {Dav} from '../services/dav';
import {Store} from '../services/store';
import {Sort} from '../services/sort';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {Navigation} from '../services/navigation';

@Component({
  selector: 'dav-home',
  templateUrl: '../../html/home.html',
  styleUrls: ['../../assets/scss/home.scss'],
  encapsulation: ViewEncapsulation.None,
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
    this.connect(
      this._dav.ready$,
      async () => {
        if (Home.lastTab != null) {
          this._selectedTab = Home.lastTab;
        }
        else {
          this._selectedTab = await this._store.getDefaultTab();
        }
        this._tab(<any>{index: this._selectedTab});
        await this._sort.sort();
      },
    );

    this.connect(this._sort.sorted$, () => {
      this._setItems();
      this._loaded = true;
    });

    const tabs = await this._store.getVisibleTabs();
    this._tabs[0] = tabs.indexOf(SelectedTab.FAVORITES) != -1;
    this._tabs[1] = tabs.indexOf(SelectedTab.CONTACTS) != -1;
    this._tabs[2] = tabs.indexOf(SelectedTab.GROUPS) != -1;
    this._onlyOneTab = tabs.length == 1;
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

  protected _tab(ev: MatTabChangeEvent) {
    Home.lastTab = ev.index;
    this._nav.routeData$.next({withSearch: [SelectedTab.GROUPS, SelectedTab.CONTACTS].indexOf(ev.index) != -1, title: 'Contacts'});
  }

  protected _add() {
    this.navigate('details/new');
  }

  protected _swipe(ev: SwipeEvent, bar: MatTabGroup) {
    let idx = bar.selectedIndex + (ev == 'left' ? -1 : 1);
    if (idx < 0) {
      idx = 0;
    }
    if (idx >= this._tabs.length) {
      idx = this._tabs.length - 1;
    }

    bar.selectedIndex = idx;
  }
}
