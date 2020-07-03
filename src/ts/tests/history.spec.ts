import {BaseTestUnit} from '../base';
import {NgTest, NgInject} from '../decorators';
import {Store} from '../services/store';
import {History} from '../services/history';
import {History as CallHistory} from '../models';
import {Dav} from '../services/dav';
import {Router} from '@angular/router';
import {MockRouter} from './mocks';

export class HistoryTests extends BaseTestUnit {
  @NgInject(History) private _service: History;
  constructor() {
    super([History, Store, Dav, {provide: Router, useClass: MockRouter}]);
  }

  @NgTest() 
  public async testHistory() {
    let h: Array<CallHistory> = await this._service.load();
    expect(h).toBeNull();
    await this._service.add('+581234');
    await new Promise(resolve => setTimeout(resolve, 100));
    await this._service.add('567899');
    await new Promise(resolve => setTimeout(resolve, 100));
    h = await this._service.load();
    expect(h.length).toEqual(2);
    expect(h[0].date instanceof Date).toBeTruthy();
    await this._service.add('00581234');
    await new Promise(resolve => setTimeout(resolve, 100));
    h = await this._service.load();
    await this._service.add('+581234');
    await new Promise(resolve => setTimeout(resolve, 100));
    h = await this._service.load();
    expect(h.length).toEqual(3);
    expect(h[0].count).toEqual(2);
  }
}
