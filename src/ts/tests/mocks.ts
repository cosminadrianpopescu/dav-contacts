import { Plugins } from '@capacitor/core';
import {SyncType, Server} from '../models';

type ParamsType = {key: string, value?: any};

export const MOCK_SERVER = <Server> {
  url: process.env.DAV_URL,
  sync: {type: SyncType.MANUAL},
  user: process.env.DAV_USER, 
  pass: process.env.DAV_PASS,
}

export class MockRouter {
  public async navigateByUrl(url: string) {
    console.log('navigating to', url);
  }
}

class MockStorage {
  private _map: Map<string, any> = new Map<string, any>();

  public get(params: ParamsType): Promise<any> {
    return new Promise(resolve => resolve({value: this._map.get(params.key) || null}));
  }

  public set(params: ParamsType): Promise<void> {
    return new Promise(resolve => {
      this._map.set(params.key, params.value);
      resolve();
    });
  }

  public remove(params: ParamsType): Promise<void> {
    return new Promise(resolve => {
      this._map.delete(params.key);
      resolve();
    })
  }
}

export function initMocks() {
  Plugins.Storage = <any>(new MockStorage());
}
