import {BaseComponent} from '../../base';
import {Component, Input, SimpleChanges, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {LabelValue} from '../../models';
import {NgCycle} from '../../decorators';
import {Dav} from '../../services/dav';

@Component({
  selector: 'dav-dropdown',
  templateUrl: '../../../html/wrappers/dropdown.html',
  styleUrls: ['../../../assets/scss/wrappers/dropdown.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Dropdown extends BaseComponent {
  @Input() public options: Array<LabelValue> = [];
  @Input() public isPrimitive: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public optionLabel: string = "label";
  @Input() public model: string | LabelValue;
  @Input() public label: string;
  @Input() public asRadio: boolean = false;
  @Input() public vertical: boolean = false;
  @Input() public showClear: boolean = false;

  public id: string;

  @Output() public modelChange: EventEmitter<string | LabelValue> = new EventEmitter<string | LabelValue>();

  protected _model: LabelValue = null;

  @NgCycle('init')
  protected _init() {
    this.id = `_${Dav.UUID()}`;
  }

  @NgCycle('change')
  protected _change(changes: SimpleChanges) {
    if (changes['model'] && this.model) {
      const option = this.options.find(o => this.isPrimitive ? o.value == this.model : o.value == (this.model as LabelValue).value);
      if (!option) {
        this.options.push(this.isPrimitive ? {value: this.model as string, label: this.model as string} : this.model as LabelValue);
      }
    }
    if (!this.isPrimitive || !changes['model']) {
      this._model = this.model as LabelValue;
      return ;
    }

    this._model = this.options.find(o => o.value == this.model);
    console.log('model is', this._model, this.model, this.options);
  }

  protected _modelChange(x: LabelValue) {
    if (x == null) {
      this._model = null;
      this.modelChange.emit(null);
      return ;
    }
    this._model = this.options.find(o => o.value == x.value)
    if (!this.isPrimitive) {
      this.modelChange.emit(x);
      return ;
    }

    this.modelChange.emit(x.value);
  }
}
