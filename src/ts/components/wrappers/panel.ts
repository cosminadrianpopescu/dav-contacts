import {Component, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {Panel as PanelWidget} from 'primeng/panel';
import {ReplaySubject} from 'rxjs';
import {BaseComponent} from '../../base';
import {NgCycle} from '../../decorators';

@Component({
  selector: 'dav-panel',
  templateUrl: '../../../html/wrappers/panel.html',
  styleUrls: ['../../../assets/scss/wrappers/panel.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Panel extends BaseComponent {
  @Input() public toggleable: boolean = true;
  @Input() public collapsed: boolean = true;
  @Input() public header: string;

  @ViewChild('panel', {static: true}) private _panel: PanelWidget;
  protected _collapsed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  @NgCycle('init')
  protected _initMe() {
    this._collapsed$.next(this.collapsed);
  }

  protected _click() {
    const ev = document.createEvent('MouseEvent');
    this._panel.toggle(ev);
    this._collapsed$.next(this._panel.collapsed);
  }
}
