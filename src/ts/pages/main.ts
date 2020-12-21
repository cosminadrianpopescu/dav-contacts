import {Component, NgZone} from '@angular/core';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Platform} from '@ionic/angular';
import {BaseComponent} from '../base';
import {NgInject} from '../decorators';
import {ToolbarEvent} from '../models';
import {Dav} from '../services/dav';


@Component({
  selector: 'app-root',
  templateUrl: '../../html/main.html',
  styleUrls: ['../../assets/scss/main.scss']
})
export class Main extends BaseComponent {
  @NgInject(NgZone) private _zone: NgZone;
  @NgInject(Dav) private _dav: Dav;
  protected _sidebar: boolean = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    super();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      document.addEventListener('backbutton', ev => {
        ev.stopPropagation();
        ev.preventDefault();
        this._zone.run(() => {
          this.navigate('');
        });
      }, false);
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  protected _toolbar(ev: ToolbarEvent) {
    if (ev.type == 'menu') {
      this._sidebar = true;
    }
  }

  protected async _nav(where: string) {
    this._sidebar = false;
    if (where == 'sync') {
      await this.showLoading();
      await this._dav.sync();
      await this.hideLoading();
      return ;
    }
    this.navigate(where);
  }
}
