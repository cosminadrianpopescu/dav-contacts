import {Component, Input, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {BaseComponent} from '../base';
import {NgInject} from '../decorators';
import {Dav} from '../services/dav';
import {FilteringItem, FilteringEventType, ModelFactory, FilteringEvent} from '../models';
import {AsHtml} from '../pipes';

@Component({
  selector: 'dav-contacts-list',
  templateUrl: '../../html/filtering.html',
  styleUrls: ['../../assets/scss/filtering.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContactsList extends BaseComponent {
  @NgInject(Dav) private _dav: Dav;
  @Output() public notify: EventEmitter<FilteringEvent> = new EventEmitter<FilteringEvent>();

  protected _items: Array<FilteringItem> = [];

  @Input() public set filter(value: string) {
    if (value == '') {
      this._items = [];
      return ;
    }

    const pipe = new AsHtml();

    this._items = this._dav.filterByPhoneNumber(value).map(f => <FilteringItem>{
      line1: this._dav.getContactName(f.contact),
      line2: pipe.transform(f.match.replace(value, `<span class="highlighted">${value}</span>`)),
      showSave: false,
      original: f.contact,
    });
  }

  protected _notify(type: FilteringEventType, item: FilteringItem) {
    this.notify.emit(ModelFactory.instance(<FilteringEvent>{type: type, item: item.original}, FilteringEvent) as FilteringEvent);
  }
}
