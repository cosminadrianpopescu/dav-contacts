import {Component, ElementRef, ViewChild, TemplateRef} from '@angular/core';
import {BaseInputWithMetadata} from '../base';
import {NgInject} from '../decorators';
import {FileService} from '../services/file';
import {to} from '../models';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'dav-single-binary',
  templateUrl: '../../html/form.html',
  styleUrls: ['../../assets/scss/form.scss'],
})
export class Binary extends BaseInputWithMetadata {
  @NgInject(FileService) private _service: FileService;
  @NgInject(MatDialog) private _modal: MatDialog;

  @ViewChild('file', {static: false}) private _file: ElementRef;
  @ViewChild('photoAction', {static: false}) private _tpl: TemplateRef<any>;
  private _ref: MatDialogRef<any, any>;

  private _redraw() {
    const tmp = this.contact;
    this.contact = null;
    setTimeout(() => this.contact = tmp);
  }

  protected async _click() {
    if (this.readOnly) {
      return ;
    }
    if (this.metadata.value) {
      this._ref = this._modal.open(this._tpl);
      return ;
    }

    this._choose();
  }

  private _closeModal() {
    if (this._ref) {
      this._ref.close();
      this._ref = null;
    }
  }

  protected async _choose() {
    this._closeModal();
    if (this.readOnly) {
      return ;
    }
    const [err, result] = await to(this._service.get(this._file.nativeElement));
    if (err) {
      this.alert('Unknown file type selected. Please select a PNG, JPG or GIF');
      return ;
    }
    this.metadata.value = `data:${result.type};base64,${result.content}`;
    this._redraw();
  }

  protected _remove() {
    this._closeModal();
    this.metadata.value = null;
    this._redraw();
  }
}
