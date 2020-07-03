import {Directive, EventEmitter, HostListener, Output} from '@angular/core';
import {BaseComponent} from '../base';
import {SwipeEvent} from '../models';

const THRESHOLD = 80;

class Point {
  x: number;
  y: number;
}

@Directive({
  selector: '[dav-swipe]',
})
export class Swipe extends BaseComponent {
  @Output() public swipe: EventEmitter<SwipeEvent> = new EventEmitter<SwipeEvent>();
  private _start: Point = null;

  private _processEvent(ev: MouseEvent | TouchEvent): Point {
    const result = new Point();
    if (ev instanceof MouseEvent) {
      result.x = ev.x;
      result.y = ev.y;
    }
    else {
      let touch: Touch = ev.touches[0];
      if (!touch) {
        touch = ev.changedTouches[0];
      }
      result.x = touch.clientX;
      result.y = touch.clientY;
    }

    return result;
  }

  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  protected _beginSwipe(ev: MouseEvent | TouchEvent) {
    this._start = this._processEvent(ev);
  }

  private _processSwipe(ev: MouseEvent | TouchEvent) {
    const end = this._processEvent(ev);
    // Either no swipe, either it was something vertically and we don't support
    // this swipe.
    if (Math.abs(end.y - this._start.y) > THRESHOLD || Math.abs(end.x - this._start.x) <= THRESHOLD / 2) {
      return ;
    }

    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();

    this.swipe.emit(end.x - this._start.x > 0 ? 'left' : 'right');
  }

  @HostListener('touchend', ['$event'])
  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  protected _endSwipe(ev: MouseEvent) {
    if (!this._start) {
      return ;
    }
    this._processSwipe(ev);
    this._start = null;
  }
}
