import {BaseComponent} from '../base';
import {Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {KeyValue} from '../models';

@Component({
  selector: 'dav-checkbox-group',
  templateUrl: '../../html/checkbox-group.html',
  styleUrls: ['../../assets/scss/checkbox-group.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CheckboxGroup extends BaseComponent {
  @Input() public label: string;
  @Input() public options: Array<KeyValue> = [];
  @Input() public model: Array<string> = [];

  @Output() public modelChange: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

  protected _change(ev: KeyValue, sel: boolean) {
    if (!sel) {
      this.model = this.model.filter(k => k != ev.key);
    }
    else {
      this.model.push(ev.key);
      this.model = [].concat(this.model);
    }

    this.modelChange.emit(this.model);
  }
}
