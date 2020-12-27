import {EventEmitter, Injectable} from '@angular/core';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {CallLog} from '@ionic-native/call-log/ngx';
import {WebIntent} from '@ionic-native/web-intent/ngx';
import {Platform} from '@ionic/angular';
import {take} from 'rxjs/operators';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';
import {CallLog as CallLogModel, CallType, Contact, FilteringEvent, History, NumberDialed, to, ClickAction} from '../models';
import {Dav} from './dav';
import {Store} from './store';
import {Router} from '@angular/router';

@Injectable()
export class Dialer extends BaseClass {
  @NgInject(Store) private _store: Store;
  @NgInject(Dav) private _dav: Dav;
  @NgInject(WebIntent) private _intent: WebIntent;
  @NgInject(Router) private _router: Router;
  @NgInject(AndroidPermissions) private _perm: AndroidPermissions;
  @NgInject(Platform) private _platform: Platform;
  @NgInject(CallLog) private _callLog: CallLog;

  public numberDialed$: EventEmitter<NumberDialed> = new EventEmitter<NumberDialed>();
  public selectNumber$: EventEmitter<Contact> = new EventEmitter<Contact>();
  public numberSelected$: EventEmitter<string> = new EventEmitter<string>();
  public contactSelected$: EventEmitter<Contact> = new EventEmitter<Contact>();

  public contactFromEvent(f: FilteringEvent): Contact {
    if (f.item instanceof Contact) {
      return f.item as Contact;
    }

    const item = f.item as History;
    if (!item.uid) {
      return null;
    }

    return this._dav.contactById(item.uid);
  }

  public async processClick(who: string | Contact, ev: MouseEvent, type: ClickAction) {
    ev.stopPropagation();
    ev.preventDefault();
    if (!who) {
      return ;
    }
    if (!type) {
      type = await this._store.getAction();
    }

    if (type == 'call' && who) {
      this.dial(who);
    }
    else if (['view', 'edit'].indexOf(type) != -1 && who && who instanceof Contact) {
      const id = this._dav.contactId(who);
      this._router.navigateByUrl(`details/${type == 'edit' ? 'edit/' : ''}${id}`);
    }
    else if (type == 'select' && who && who instanceof Contact) {
      this.contactSelected$.emit(who);
    }
  }

  public async getNumber(c: Contact): Promise<string> {
    const numbers = this._dav.contactPhones(c);
    if (numbers.length == 0) {
      return null;
    }
    if (numbers.length == 1) {
      return this._dav.contactPhones(c)[0];
    }
    this.selectNumber$.emit(c);
    const result = await new Promise<string>(resolve => this.numberSelected$.pipe(take(1)).subscribe(n => resolve(n)));
    return result;
  }

  private async _permission(): Promise<boolean> {
    const p = await this._perm.checkPermission(this._perm.PERMISSION.CALL_PHONE);
    if (!p.hasPermission) {
      const [err, result] = await to(this._perm.requestPermission(this._perm.PERMISSION.CALL_PHONE));
      if (err || !result.hasPermission) {
        return false;
      }
    }

    return true;
  }

  private async _dialAndroid(number: string, contactIntent?: CallType) {
    const intent = contactIntent || await this._store.getCallType();
    if (intent == 'CALL') {
      const permissions = await this._permission();
      if (!permissions) {
        throw new Error('PERMISSION_DENIED');
      }
    }

    await this._intent.startActivityForResult({
      url: `tel:${number}`,
      action: `android.intent.action.${intent || 'DIAL'}`,
    });
  }

  private async _dial(number: string) {
    const a = document.createElement('a');
    a.setAttribute('style', 'display: none');
    a.href = `tel: ${number}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a));
  }

  private _emit(number: string, who: string | Contact) {
    this.numberDialed$.emit({number: number, contact: who instanceof Contact ? who : null});
  }

  public async dial(who: string | Contact): Promise<any>{
    console.log('dialing', who);
    const start = new Date();
    let intent: CallType = null;
    let number: string;
    if (who instanceof Contact) {
      number = await this.getNumber(who);
      intent = this._dav.getContactIntent(who);
    }
    else {
      number = who;
    }

    const callback = this._platform.is('android') ? this._dialAndroid.bind(this) : this._dial.bind(this);
    const [err] = await to(callback(number, intent));

    if (!err) {
      if (!this._platform.is('android')) {
        this._emit(number, who);
        return ;
      }
      const end = new Date();
      // If less than 5 seconds, consider the number has not been dialed.
      if (end.getTime() - start.getTime() <= 5000) {
        return ;
      }
      const perm = await this._callLog.hasReadPermission();
      if (perm) {
        const log: Array<CallLogModel> = await this._callLog.getCallLog([]);
        if (log.length > 0) {
          if (Dav.areSameNumbers(log[0].number, number)) {
            return ;
          }
        }
      }
      this._emit(number, who);
    }
  }
}
