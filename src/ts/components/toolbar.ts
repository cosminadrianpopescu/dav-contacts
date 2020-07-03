import {Component, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {BaseComponent} from '../base';
import {ToolbarEvent} from '../models';
import {MatInput} from '@angular/material/input';
import {NgInject, NgCycle} from '../decorators';
import {Dav} from '../services/dav';
import {Navigation} from '../services/navigation';
import {fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {Search} from '../services/search';

@Component({
  selector: 'dav-toolbar',
  templateUrl: '../../html/toolbar.html',
  styleUrls: ['../../assets/scss/toolbar.scss']
})
export class Toolbar extends BaseComponent {
  @Output() public notify: EventEmitter<ToolbarEvent> = new EventEmitter<ToolbarEvent>();
  protected _inSearch: boolean = false;
  protected _term: string = '';
  @NgInject(Dav) private _dav: Dav;
  @NgInject(Navigation) private _nav: Navigation;

  protected _withSearch: boolean = false;

  @ViewChild('input', {static: true, read: MatInput}) private _input: MatInput;
  @ViewChild('natInput', {static: true, read: ElementRef}) private _natInput: ElementRef;

  @NgCycle('init')
  protected _initMe() {
    this.connect(this._nav.routeData$, data => {
      this._withSearch = typeof(data['withSearch']) != 'undefined' && data['withSearch'] == true;
      if (!this._withSearch) {
        this._inSearch = false;
        this._setTerm('');
      }
    });
  }

  private _setTerm(s: string) {
    this._term = s;
    Search.notify$.next(this._term);
  }

  @NgCycle('afterViewInit')
  protected _afterView() {
    const obs = fromEvent(this._natInput.nativeElement, 'keyup')
      .pipe(debounceTime(300));
    this.connect(obs, () => Search.notify$.next(this._term));
  }

  protected _search() {
    this._inSearch = true;
    setTimeout(() => this._input.focus());
  }

  protected _back() {
    this._setTerm('');
    this._inSearch = false;
  }

  protected _menu() {
    this.notify.emit(<ToolbarEvent>{type: 'menu'});
  }

  protected async _sync() {
    await this.showLoading();
    await this._dav.sync();
    await this.hideLoading();
  }
}
