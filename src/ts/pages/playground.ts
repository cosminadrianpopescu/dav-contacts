import {Component} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Contact} from '../models';
import {Dav} from '../services/dav';

@Component({
  selector: 'dav-playground',
  templateUrl: '../../html/playground.html',
  styleUrls: ['../../assets/scss/playground.scss'],
})
export class Playground extends BaseComponent {
  @NgInject(Dav) private _dav: Dav;
  private _contact: Contact;
  protected _readonly = false;

  protected _checkbox = ['op2'];

  @NgCycle('init')
  protected _initMe() {
    this.connect(this._dav.ready$, () => {
      this._contact = this._dav.contactsByNumber('0467639178')[0];
      console.log('contact is', this._contact);
    });
  }

  protected _model() {
    console.log('model is', this._checkbox);
    this._readonly = !this._readonly;
    console.log('tags are', this._dav.getContactTags(this._contact));
    console.log('name is', this._dav.getContactName(this._contact));
    console.log('fullname is', this._contact.metadata.find(m => m.vcardId == 'FULLNAME'));
    console.log('tel is', this._contact.metadata.find(m => m.vcardId == 'TEL'));
    console.log('categories are', this._contact.metadata.find(m => m.vcardId == 'CATEGORIES'));
    console.log('name is', this._contact.metadata.find(m => m.vcardId == 'N'));
    console.log('adr is', this._contact.metadata.find(m => m.vcardId == 'ADR'));
  }
}
