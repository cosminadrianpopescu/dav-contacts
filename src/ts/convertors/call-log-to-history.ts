import {NgInject} from '../decorators';
import {CallLog, History} from '../models';
import {Dav} from '../services/dav';
import {Injectable} from '@angular/core';
import {BaseClass} from '../base';

@Injectable()
export class CallLog2History extends BaseClass {
  @NgInject(Dav) private _dav: Dav;

  public convert(src: CallLog): History {
    const result = new History();
    const contacts = this._dav.searchContactByPhone(src.number);

    result.number = src.number;
    result.date = new Date(src.date);
    result.type = src.type;

    if (contacts.length >= 1) {
      result.uid = this._dav.contactId(contacts[0]);
    }

    result.count = 1;

    return result;
  }

  public convertAll(src: Array<CallLog>): Array<History> {
    return src
      .map(l => this.convert(l))
      .reduce((acc, v) => {
        if (acc.length > 0 && acc[acc.length - 1].uid == v.uid) {
          acc[acc.length - 1].count++;
          return acc;
        }

        return acc.concat(v);
      }, []);
  }
}
