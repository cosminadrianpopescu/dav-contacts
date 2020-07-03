import {Component} from '@angular/core';
import {BaseInputWithMetadata} from '../base';
import {NgCycle} from '../decorators';

@Component({
  selector: 'dav-single-input',
  templateUrl: '../../html/form.html',
  styleUrls: ['../../assets/scss/form.scss'],
})
export class SingleInput extends BaseInputWithMetadata {
}
