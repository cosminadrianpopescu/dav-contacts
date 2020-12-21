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

  public id: string;

  @Output() public modelChange: EventEmitter<string | LabelValue> = new EventEmitter<string | LabelValue>();

  protected _model: LabelValue = null;

  @NgCycle('init')
  protected _init() {
    this.id = `_${Dav.UUID()}`;
  }

  @NgCycle('change')
  protected _change(changes: SimpleChanges) {
    if (!this.isPrimitive || !changes['model']) {
      this._model = this.model as LabelValue;
      return ;
    }

    this._model = this.options.find(o => o.value == this.model);
  }

  protected _modelChange(x: LabelValue) {
    if (!this.isPrimitive) {
      this.modelChange.emit(x);
      return ;
    }

    this.modelChange.emit(x.value);
  }
}
