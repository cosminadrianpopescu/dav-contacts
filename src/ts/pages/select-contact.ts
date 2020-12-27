import {Component} from '@angular/core'; 
import {BaseComponent} from '../base';
import {AddressBook} from '../models';
import {NgInject, NgCycle} from '../decorators';
import {Dav} from '../services/dav';
import {filter, take} from 'rxjs/operators';
import {Sort} from '../services/sort';
import {Navigation} from '../services/navigation';
import {Dialer} from '../services/dialer';

@Component({
  selector: 'dav-select-contact',
  templateUrl: '../../html/select-contact.html',
  styleUrls: ['../../assets/scss/select-contact.scss'],
})
export class SelectContact extends BaseComponent {
  protected _book: AddressBook;
  @NgInject(Dav) private _dav: Dav;
  @NgInject(Sort) private _sort: Sort;
  @NgInject(Navigation) private _nav: Navigation;
  @NgInject(Dialer) private _dialer: Dialer;

  private _number: string;

  @NgCycle('init')
  protected async _initMe() {
    await new Promise(resolve => this._dav.ready$.pipe(filter(result => !!result), take(1)).subscribe(resolve));
    this.connect(this._nav.connectToRoute('number'), number => {
      this._number = number;
      this._sort.sort();
      this._book = this._dav.addressBook;
    });
    this.connect(this._dialer.contactSelected$, contact => {
      console.log('contact is', contact);
      this.navigate(`details/edit/${this._dav.contactId(contact)}/${this._number}`);
    });
  }
}
