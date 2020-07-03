import {BaseClass} from '../base';
import {Injectable} from '@angular/core';
import {NgInject} from '../decorators';
import {FileChooser} from '@ionic-native/file-chooser/ngx';
import {Platform} from '@ionic/angular';
import {FileResult, to, ModelFactory} from '../models';
import {Plugins} from '@capacitor/core';
import {fromEvent} from 'rxjs';
import {take} from 'rxjs/operators';

const {Filesystem} = Plugins;

const UNKNOWN = 'application/octet';

@Injectable()
export class FileService extends BaseClass {
  @NgInject(Platform) private _platform: Platform;
  @NgInject(FileChooser) private _chooser: FileChooser;

  private _getType(content: string): string {
    const signatures = {
      R0lGODdh: "image/gif",
      R0lGODlh: "image/gif",
      iVBORw0KGgo: "image/png",
      '/9j/': 'image/jpg',
    }
    for (let s in signatures) {
      if (content.indexOf(s) == 0) {
        return signatures[s];
      }
    }
    return UNKNOWN;
  }

  private async _getAndroid(): Promise<FileResult> {
    const file = await this._chooser.open();
    const [err, contents] = await to(Filesystem.readFile({path: file}));
    if (err) {
      throw err;
    }

    return ModelFactory.instance({path: file, content: contents.data}, FileResult) as FileResult;
  }

  private async _getDesktop(el: HTMLInputElement): Promise<FileResult> {
    el.click();
    const file: File = await new Promise(resolve => fromEvent(el, 'change').pipe(take(1)).subscribe(() => resolve(<any>el.files[0])));

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const r: FileReader = reader['__zone_symbol__originalInstance'] || reader;

      r.onloadend = function() {
        resolve(ModelFactory.instance({path: file.name, content: btoa(this.result as string)}, FileResult) as FileResult);
        el.files = null;
      }
      r.onerror = async function() {
        reject(this.error);
        el.files = null;
      }
      r.readAsBinaryString(file);
    });
  }

  public async get(el: HTMLInputElement): Promise<FileResult> {
    let result: FileResult;
    if (this._platform.is('android')) {
      result = await this._getAndroid();
    }
    else {
      result = await this._getDesktop(el);
    }

    result.type = this._getType(result.content);
    if (result.type == UNKNOWN) {
      throw Error('UNKNOWN_TYPE');
    }

    return result;
  }
}
