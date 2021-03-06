import { Component } from '@angular/core';
import { BaseComponent } from '../base';
import {Server, SyncType, ServerSync, to} from '../models';
import {NgCycle, NgInject} from '../decorators';
import {Dav} from '../services/dav';
import {Nextcloud} from '../nextcloud/nextcloud';
import {Store} from '../services/store';

@Component({
  selector: 'dav-add-server',
  templateUrl: '../../html/add-server.html',
  styleUrls: ['../../assets/scss/add-server.scss'],
})
export class AddServer extends BaseComponent {
  @NgInject(Dav) private _dav: Dav;
  @NgInject(Nextcloud) private _nc: Nextcloud;
  @NgInject(Store) private _store: Store;
  private _model: Server = new Server();
  protected _options = [
    {key: SyncType.MANUAL, value: 'Manual'},
    {key: SyncType.INTERVAL, value: 'At an interval'},
    {key: SyncType.ON_START, value: 'On application start'},
  ];

  @NgCycle('init')
  protected async _initMe() {
    this._model = await this._store.getServer();
    if (!this._model) {
      this._model = new Server();
      this._model.sync = new ServerSync();
      this._model.sync.type = SyncType.MANUAL;
    }
  }

  protected async _add() {
    await this.showLoading();
    const [err, result] = await to(this._nc.login(this._model.url));
    const msg = err ? err.message : 'You have been authenticated with nextcloud';
    await this.hideLoading();
    this.alert(msg);
    if (result) {
      this._model.url = `${this._model.url}/remote.php/dav/`;
      this._model.user = result.loginName;
      this._model.pass = result.appPassword;
      await this._dav.addServer(this._model);
      this.navigate('');
    }
  }
}
