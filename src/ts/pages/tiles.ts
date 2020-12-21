import {Component} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Contact} from '../models';
import {Sort} from '../services/sort';

@Component({
  selector: 'dav-tiles',
  templateUrl: '../../html/tiles.html',
  styleUrls: ['../../assets/scss/tiles.scss'],
})
export class Tiles extends BaseComponent {
  @NgInject(Sort) private _sort: Sort;

  protected _items: Array<Contact> = [];

  @NgCycle('init')
  protected async _initMe() {
    this._items = await this._sort.contactsByImportance();
    this._items.splice(10);
  }
}
