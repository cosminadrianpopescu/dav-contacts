import {BaseComponent} from '../base';
import {Component, Input} from '@angular/core';
import {Contact} from '../models';
import {NgCycle, NgInject} from '../decorators';
import {Dav} from '../services/dav';
import {ContactInitials} from '../pipes';

@Component({
  selector: 'dav-avatar',
  templateUrl: '../../html/avatar.html',
  styleUrls: ['../../assets/scss/avatar.scss'],
})
export class Avatar extends BaseComponent {
  @Input() public contact: Contact;
  @Input() public doubleSize: boolean = false;

  @NgInject(Dav) private _dav: Dav;
  protected _color: string;
  protected _text: string;

  @NgCycle('init')
  protected _initMe() {
    this._color = this._dav.avatarColor(this.contact);
    const pipe = new ContactInitials();
    this._text = pipe.transform(this.contact);
  }
}
