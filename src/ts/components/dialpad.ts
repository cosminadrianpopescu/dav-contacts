import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'dav-dialpad',
  templateUrl: '../../html/dialpad.html',
  styleUrls: ['../../assets/scss/dialpad.scss'],
})
export class Dialpad extends BaseComponent {
  @Output() public dial: EventEmitter<string> = new EventEmitter<string>();
  @Output() public numberChanged: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('input', {static: true}) private _input: ElementRef;

  @Input() public set text(value: String) {
    this._change(value.toString());
  }

  public get text() {
    return this._text;
  }

  private _text: String = '';

  protected _keys = [
    {no: 1, txt: '&nbsp;'},
    {no: 2, txt: 'ABC'},
    {no: 3, txt: 'DEF'},
    {no: 4, txt: 'GHI'},
    {no: 5, txt: 'JKL'},
    {no: 6, txt: 'MNO'},
    {no: 7, txt: 'PQRS'},
    {no: 8, txt: 'TUV'},
    {no: 9, txt: 'WXYZ'},
    {no: '*', txt: '&nbsp;'},
    {no: 0, txt: '+', longPress: true},
    {no: '#', txt: '&nbsp;'},
  ];

  private get _el(): HTMLInputElement {
    return this._input.nativeElement;
  }

  protected _change(s: string) {
    this._text = s;
    this._setText();
    this._el.setSelectionRange(this._text.length, this._text.length);
  }

  private _setText() {
    this.numberChanged.emit(this._text.toString());
  }

  private async _removeSelection() {
    if (this._el.selectionStart == this._el.selectionEnd) {
      return ;
    }
    const idx = this._el.selectionStart;
    this._text = this._text.splice(this._el.selectionStart, this._el.selectionEnd - this._el.selectionStart, "");
    await new Promise(resolve => setTimeout(resolve));
    this._el.setSelectionRange(idx, idx);
  }

  private async _moveSelection(idx: number) {
    await new Promise(resolve => setTimeout(resolve));
    this._el.setSelectionRange(idx, idx);
  }

  private async _addText(s: string) {
    let idx: number;
    await this._removeSelection();
    idx = this._el.selectionStart;
    this._text = this._text.splice(idx, 0, s);
    await this._moveSelection(idx + 1);
    this._setText();
  }

  protected _key(s: string) {
    if (s == null) {
      return;
    }

    this._addText(s);
  }

  protected _clear() {
    this._text = '';
    this._setText();
  }

  protected async _del() {
    if (this._el.selectionStart != this._el.selectionEnd) {
      await this._removeSelection();
      return ;
    }

    if (this._text.length == 0 || this._el.selectionStart == 0) {
      return ;
    }

    const idx = this._el.selectionStart - 1;
    this._text = this._text.splice(idx, 1, "");
    this._setText();
    await this._moveSelection(idx);
  }

  protected _dial() {
    this.dial.emit(this._text.toString());
  }
}
