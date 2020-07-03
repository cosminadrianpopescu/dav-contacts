import {BaseInputWithMetadata} from '../base';
import {Component} from '@angular/core';
import {NgCycle} from '../decorators';

@Component({
  selector: 'dav-single-choice',
  templateUrl: '../../html/form.html',
  styleUrls: ['../../assets/scss/form.scss'],
})
export class SingleChoice extends BaseInputWithMetadata {
  protected _id: string;

  @NgCycle('init')
  protected _initMe() {
    this._id = SingleChoice.UUID();
  }
}
