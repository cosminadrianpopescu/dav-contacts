import {Component} from '@angular/core';
import {VCardParser} from '../lib/src';
import {MultipleText} from './multiple-text';

@Component({
  selector: 'dav-structured-multiple',
  templateUrl: '../../html/form.html',
  styleUrls: ['../../assets/scss/form.scss'],
})
export class StructuredMultiple extends MultipleText {
  protected _add() {
    this.metadata.values.push(VCardParser.newMultipleStructured(this.vcardId));
  }

  private _click(x) {
    console.log('x is', x);
  }
}
