import {Component} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle} from '../decorators';

@Component({
  selector: 'dav-side-menu',
  templateUrl: '../../html/side-menu.html'
})
export class SideMenu extends BaseComponent {
  @NgCycle('init') 
  protected _initMe() {
    console.log('init side menu');
  }
}
