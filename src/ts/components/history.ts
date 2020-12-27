import {DatePipe} from '@angular/common';
import {Component, EventEmitter, Output} from '@angular/core';
import {OverlayPanel} from 'primeng/overlaypanel';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {CallLogType, FilteringEvent, FilteringEventType, FilteringItem, ModelFactory} from '../models';
import {History as HistoryService} from '../services/history';

@Component({
  selector: 'dav-history',
  templateUrl: '../../html/filtering.html',
  styleUrls: ['../../assets/scss/filtering.scss'],
})
export class History extends BaseComponent {
  @NgInject(HistoryService) private _service: HistoryService;
  @Output() public notify: EventEmitter<FilteringEvent> = new EventEmitter<FilteringEvent>();

  protected _items: Array<FilteringItem> = [];

  @NgCycle('init')
  protected async _initMe() {
    const history = await this._service.load();
    const pipe = new DatePipe('en-US');
    this._items = history.map(h => <FilteringItem>{
      line1: this._service.label(h),
      line2: pipe.transform(h.date),
      isLocal: h.type == CallLogType.LOCAL_HISTORY,
      showSave: !h.uid,
      original: h,
    })
  }

  protected _notify(type: FilteringEventType, item: FilteringItem, menu: OverlayPanel) {
    menu.hide();
    this.notify.emit(ModelFactory.instance(<FilteringEvent>{type: type, item: item.original}, FilteringEvent) as FilteringEvent);
  }
}
