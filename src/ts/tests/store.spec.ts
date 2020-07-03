import {BaseTestUnit} from '../base';
import {NgInject, NgTest} from '../decorators';
import {Server} from '../models';
import {Store} from '../services/store';
import {MOCK_SERVER} from './mocks';
import {Plugins} from '@capacitor/core';


export class StoreTest extends BaseTestUnit {
  @NgInject(Store) private _store: Store;
  constructor() {
    super([Store]);
  }

  @NgTest()
  protected async _test() {
    let s: Server = await this._store.getServer();
    expect(s).toBeNull();
    await this._store.setServer(MOCK_SERVER);
    s = await this._store.getServer();
    expect(s.user).toEqual(process.env.DAV_USER);
    Plugins.Storage['_map'] = new Map<string, any>();
  }
}
