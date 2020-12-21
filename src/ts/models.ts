import {Type} from '@angular/core';
import {deserialize, deserializers, Convertor} from './decorators';
import {VCardMetadata} from './lib/src';

export enum LogLevel {DEBUG = 0, INFO = 1, ERROR = 2};
export enum SyncType {MANUAL = "0", ON_START = "1", INTERVAL = "2"};

export class ModelFactory {
  private static _create<T>(json: Object, type: Type<T>): T {
    const result = new type();
    Object.keys(json).forEach(k => {
      const d = deserializers(type).find(d => d.prop == k);
      const value = json[k];
      if (!d || typeof(value) == 'undefined' || value == null) {
        result[k] = value;
        return ;
      }
      if (d.arg == 'date') {
        result[k] = new Date(json[k]);
        return ;
      }
      if (typeof(d.arg) == 'function' && !!d.arg.prototype['convert']) {
        const convertor: Convertor<any> = new d.arg();
        result[k] = convertor.convert(value);
        return ;
      }
      result[k] = ModelFactory.instance(value, d.arg);
    });
    return result;
  }
  public static instance<T>(json: Object | Array<Object>, type: Type<T>): T | Array<T> {
    if (typeof(json) == 'undefined' || json == null) {
      return null;
    }

    if (Array.isArray(json)) {
      return json.map(j => ModelFactory._create(j, type));
    }
    return ModelFactory._create(json, type);
  }
}

export class ServerSync {
  public type: SyncType;
  public interval?: number; // hours
}

export class Server {
  public url: string;
  public user: string;
  public pass: string;
  public sync: ServerSync;
}

export class Contact {
  url: string;
  etag: string;
  version: string;
  metadata: Array<VCardMetadata>;
}

export class AddressBook {
  public name: string;
  public href: string;
  @deserialize(Contact)
  public contacts: Array<Contact>;
}

export enum CallLogType {
  INCOMING_TYPE, OUTGOING_TYPE, MISSED_TYPE, VOICEMAIL_TYPE, REJECTED_TYPE, BLOCKED_TYPE, ANSWERED_EXTERNALLY_TYPE, LOCAL_HISTORY
}

export class CallLog {
  date: number;
  number: string;
  type: CallLogType;
}

export class History {
  public uid: string;
  public type?: CallLogType;
  public number: string;
  public count: number;
  @deserialize('date')
  public date: Date;
}

export class FilteringItem {
  line1: string;
  line2: string;
  showSave: boolean;
  original: History | Contact;
}

export class FilteringResult {
  contact: Contact;
  match: string;
}

export type FilteringEventType = 'save' | 'edit' | 'call';

export type ClickAction = 'call' | 'edit' | 'view';

export type CallType = 'CALL' | 'DIAL';

export type SortType = 'call-count' | 'first-name' | 'last-name' | 'full-name';

export class FilteringEvent {
  type: FilteringEventType;
  item: History | Contact;
}

export class NumberDialed {
  number: string;
  contact?: Contact;
}

export class ToolbarEvent {
  type: 'search' | 'menu' | 'sort';
  arg: string;
}

export const NO_TAG = 'No tags';
export const FAV_TAG = 'Favourites';
export const CATEGORIES = 'CATEGORIES';
export const TEL = 'TEL';

export enum SelectedTab {
  FAVORITES = 0, CONTACTS = 1, GROUPS = 2,
}

export async function to<T>(promise: Promise<T>): Promise<[Error, T]> {
  try {
    const data = await promise;
    return [null, data];
  }
  catch (err) {
    return [err, null];
  }
}

export class FileResult {
  content: string;
  path: string;
  type: string;
}

export type KeyValue = {key: string, value: string};
export type SwipeEvent = 'left' | 'right';

export class ShownField {
  vcardId: string;
  type: 'structured-multiple' | 'structured' | 'groups' | 'single-input' | 'single-choice' | 'multiple-text';
}

export class LabelValue {
  label: string;
  value: string;
}
