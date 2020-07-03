import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {of, Subscription, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {BaseComponent} from '../base';

@Directive({
  selector: '[long-press]'
})
export class LongPress extends BaseComponent {
  @Input('long-press') public value: boolean;
  @Output() public longPress: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  public static inPress: boolean = false;

  private _s: Subscription = null;

  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  protected _beginPress(ev: MouseEvent) {
    if (!this.value) {
      return ;
    }
    LongPress.inPress = true;
    this._s = timer(500).pipe(switchMap(() => of(true))).subscribe(() => {
      this.longPress.emit(ev);
      this._s = null;
      LongPress.inPress = false;
    });
  }

  @HostListener('touchend', ['$event'])
  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  protected _endPress(ev: MouseEvent) {
    if (!this.value || !LongPress.inPress) {
      return ;
    }
    LongPress.inPress = false;
    if (this._s) {
      this._s.unsubscribe();
      return ;
    }
    ev.stopPropagation();
    ev.preventDefault();
    ev.stopImmediatePropagation();
  }
}
