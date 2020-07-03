import {BaseTestUnit} from '../base';
import {NgInject, NgTest} from '../decorators';
import {CallLog2History} from '../convertors/call-log-to-history';
import {Dav} from '../services/dav';
import {DavTest} from './dav.spec';
import {Store} from '../services/store';
import {Router} from '@angular/router';
import {MockRouter} from './mocks';

const MOCK_CALL_LOG = [
  {
    date: 1590824021497,
    number: "0032489463787",
    type: 2,
    duration: 0,
    new: 1,
    cachedName: "Lixa Popescu",
    cachedNumberType: 2,
    phoneAccountId: "8932300000017963615F",
    viaNumber: "",
    name: "Lixa Popescu",
    contact: 32,
    photo: "content://com.android.contacts/contacts/32/photo",
    thumbPhoto: "content://com.android.contacts/contacts/32/photo",
  },
  {
    date: 1590775242007,
    number: "0032489463787",
    type: 2,
    duration: 0,
    new: 1,
    cachedName: "Lixa Popescu",
    cachedNumberType: 2,
    phoneAccountId: "8932300000017963615F",
    viaNumber: "",
    name: "Lixa Popescu",
    contact: 32,
    photo: "content://com.android.contacts/contacts/32/photo",
    thumbPhoto: "content://com.android.contacts/contacts/32/photo",
  },
  {
    date: 1590770302022,
    number: "+32475328869",
    type: 2,
    duration: 0,
    new: 1,
    cachedName: "Cata Popescu",
    cachedNumberType: 2,
    phoneAccountId: "8932300000017963615F",
    viaNumber: "",
    name: "Cata Popescu",
    contact: 34,
  },
  {
    date: 1590765617079,
    number: "+32475328869",
    type: 2,
    duration: 8,
    new: 1,
    cachedName: "Cata Popescu",
    cachedNumberType: 2,
    phoneAccountId: "8932300000017963615F",
    viaNumber: "",
    name: "Cata Popescu",
    contact: 34,
  },
  {
    date: 1590765526142,
    number: "0032489463787",
    type: 2,
    duration: 0,
    new: 1,
    cachedName: "Lixa Popescu",
    cachedNumberType: 2,
    phoneAccountId: "8932300000017963615F",
    viaNumber: "",
    name: "Lixa Popescu",
    contact: 32,
    photo: "content://com.android.contacts/contacts/32/photo",
    thumbPhoto: "content://com.android.contacts/contacts/32/photo",
  },
];

export class TestConvertors extends BaseTestUnit {
  @NgInject(CallLog2History) private _c1: CallLog2History;
  @NgInject(Dav) private _dav: Dav;

  constructor() {
    super([CallLog2History, Dav, Store, {provide: Router, useClass: MockRouter}]);
  }

  @NgTest('testing convertors', true)
  public async testConvertor() {
    await DavTest.add(this._dav);
    const history = this._c1.convertAll(MOCK_CALL_LOG);
    console.log('history is', history);
    DavTest.del();
  }
}
