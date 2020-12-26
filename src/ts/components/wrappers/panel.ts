import {Component, Input, ViewChild, ViewEncapsulation, SimpleChanges} from '@angular/core';
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
  @Input() public disabled: boolean = false;
  @Input() public isHeaderBold: boolean = false;

  @ViewChild('panel', {static: true}) private _panel: PanelWidget;
  public collapsed$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  @NgCycle('change')
  protected _change(changes: SimpleChanges) {
    if (!changes || !changes['collapsed']) {
      return ;
    }
    this.collapsed$.next(this.collapsed);
  }

  protected _click() {
    if (this.disabled) {
      return ;
    }
    const ev = document.createEvent('MouseEvent');
    this._panel.toggle(ev);
    this.collapsed$.next(this._panel.collapsed);
  }
}
