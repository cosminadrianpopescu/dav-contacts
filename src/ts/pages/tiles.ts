import { BaseComponent } from '../base';
import {Component, ViewEncapsulation} from '@angular/core';
import {NgInject, NgCycle} from '../decorators';
import {Sort} from '../services/sort';
import {Contact} from '../models';

@Component({
  selector: 'dav-tiles',
  templateUrl: '../../html/tiles.html',
  styleUrls: ['../../assets/scss/tiles.scss'],
  encapsulation: ViewEncapsulation.None,
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
