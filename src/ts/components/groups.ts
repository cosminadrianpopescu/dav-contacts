import {COMMA, ENTER, SPACE} from '@angular/cdk/keycodes';
import {Component} from '@angular/core';
import {BaseInputWithMetadata} from '../base';
import {NgInject} from '../decorators';
import {CATEGORIES} from '../models';
import {Dav} from '../services/dav';

@Component({
  selector: 'dav-groups',
  templateUrl: '../../html/form.html',
  styleUrls: ['../../assets/scss/form.scss'],
})
export class Groups extends BaseInputWithMetadata {
  @NgInject(Dav) private _dav: Dav;
  protected _keys: Array<number> = [SPACE, ENTER, COMMA];

  constructor() {
    super();
    this.vcardId = CATEGORIES;
  }
  
  protected async _add(tags: Array<string>) {
    this._dav.setContactTags(this.contact, tags);
  }
}
