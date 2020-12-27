import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {BaseComponent} from '../base';
import {Contact, FilteringEvent, History as HistoryModel} from '../models';
import {NgInject} from '../decorators';
import {Dav} from '../services/dav';
import {Dialer} from '../services/dialer';

@Component({
  selector: 'dav-dialpad',
  templateUrl: '../../html/dialpad.html',
  styleUrls: ['../../assets/scss/dialpad.scss'],
})
export class Dialpad extends BaseComponent {
  @Output() public numberChanged: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('input', {static: true}) private _input: ElementRef;

  @Input() public set text(value: String) {
    this._change(value.toString());
  }

  public get text() {
    return this._text;
  }

  @NgInject(Dav) private _dav: Dav;
  @NgInject(Dialer) private _dialer: Dialer;

  private _text: String = '';
  protected _forceText: boolean = false;
  protected _showDialpad: boolean = false;

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
    this._forceText = false;
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
    if (!this._text) {
      return;
    }
    this._dialer.dial(this._text.toString());
  }

  protected _toggle() {
    this._showDialpad = !this._showDialpad;
  }

  private _edit(number: string, c: Contact) {
    if (!c) {
      this._text = number;
      return ;
    }
    const numbers = this._dav.contactNumberByNumber(c, number);
    const n = numbers.length >= 1 ? numbers[0] : null;
    this._text = n || number;
  }

  protected _historyEv(ev: FilteringEvent) {
    if (ev.type == 'save') {
      this.navigate(`details/add/${(<HistoryModel>ev.item).number}`)
      return ;
    }
    const contact = this._dialer.contactFromEvent(ev);
    if (ev.type == 'edit') {
      this._showDialpad = true;
      setTimeout(() => this._edit((ev.item as HistoryModel).number, contact));
      return ;
    }

    if (ev.type == 'add-to-contact') {
      this.navigate(`select/${(<HistoryModel>ev.item).number}`);
    }
  }

  protected async _contactsEv(ev: FilteringEvent) {
    if (ev.type == 'edit') {
      const c = ev.item as Contact;
      const number = await this._dialer.getNumber(c);
      this._edit(number, c);
    }
  }

  protected _showText() {
    this._forceText = true;
    this._showDialpad = true;
  }
}
