import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {ToolbarEvent} from '../models';
import {Dav} from '../services/dav';
import {Navigation} from '../services/navigation';
import {Search} from '../services/search';
import {TextInput} from './wrappers/input';

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

  @ViewChild('input', {static: true, read: TextInput}) private _input: TextInput;

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
    const obs = fromEvent(this._input.input.nativeElement, 'keyup')
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
