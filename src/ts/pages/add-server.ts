import { Component } from '@angular/core';
import { BaseComponent } from '../base';
import {Server, SyncType, ServerSync} from '../models';
import {NgCycle, NgInject} from '../decorators';
import {Dav} from '../services/dav';

@Component({
  selector: 'dav-add-server',
  templateUrl: '../../html/add-server.html',
  styleUrls: ['../../assets/scss/add-server.scss'],
})
export class AddServer extends BaseComponent {
  @NgInject(Dav) private _dav: Dav;
  private _model: Server = new Server();
  protected _options = [
    {key: SyncType.MANUAL, value: 'Manual'},
    {key: SyncType.INTERVAL, value: 'At an interval'},
    {key: SyncType.ON_START, value: 'On application start'},
  ];

  @NgCycle('init')
  protected _initMe() {
    this._model.sync = new ServerSync();
    this._model.sync.type = SyncType.MANUAL;
  }

  protected async _add() {
    await this.showLoading();
    await this._dav.addServer(this._model);
    this.navigate('');
    await this.hideLoading();
  }
}
