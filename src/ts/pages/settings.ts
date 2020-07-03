import {Component, KeyValueDiffer, KeyValueDiffers, ViewEncapsulation} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {CallType, ClickAction, KeyValue, SelectedTab} from '../models';
import {Store} from '../services/store';

class Model {
  action: ClickAction;
  intent: CallType;
  showFav: boolean;
  defaultTab: SelectedTab;
  visibleTabs: Array<SelectedTab> = [];
  visibleFields: Array<string> = [];
}

@Component({
  selector: 'dav-settings',
  templateUrl: '../../html/settings.html',
  styleUrls: ['../../assets/scss/settings.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Settings extends BaseComponent {
  @NgInject(Store) private _store: Store;
  @NgInject(KeyValueDiffers) private _diff: KeyValueDiffers;
  private _model: Model = new Model();
  private _diffRecorder: KeyValueDiffer<string, string | boolean>;
  protected _tabsOptions: Array<KeyValue> = [
    {key: SelectedTab.FAVORITES.toString(), value: 'Favourites'},
    {key: SelectedTab.CONTACTS.toString(), value: 'Contacts'},
    {key: SelectedTab.GROUPS.toString(), value: 'Groups'},
  ];

  protected _fieldsOptions: Array<KeyValue> = [
    {key: 'N', value: 'Name'},
    {key: 'TEL', value: 'Phones'},
    {key: 'CATEGORIES', value: 'Tags'},
    {key: 'EMAIL', value: 'Email'},
    {key: 'FN', value: 'Full name'},
    {key: 'BDAY', value: 'Birth day'},
    {key: 'NICKNAME', value: 'Nickname'},
    {key: 'IMPP', value: 'Instant messenging'},
    {key: 'URL', value: 'Websites'},
    {key: 'GEO', value: 'Location'},
    {key: 'NOTE', value: 'Note'},
    {key: 'ROLE', value: 'Role'},
    {key: 'TITLE', value: 'Title'},
    {key: 'TZ', value: 'Timezone'},
    {key: 'RELATIONSHIP', value: 'Relationship'},
    {key: 'ORG', value: 'Organization'},
    {key: 'GENDER', value: 'Gender'},
    {key: 'LANG', value: 'Languages'},
    {key: 'RELATED', value: 'Related'},
  ]

  @NgCycle('init')
  protected async _initMe() {
    this._store.getCallType().then(result => this._model.intent = result);
    this._store.getAction().then(result => this._model.action = result);
    this._store.getShowFav().then(result => this._model.showFav = result);
    this._store.getDefaultTab().then(result => this._model.defaultTab = result);
    this._store.getVisibleTabs().then(result => this._model.visibleTabs = result);
    this._store.getShownFields().then(result => this._model.visibleFields = result.map(x => x.vcardId));

    this._diffRecorder = this._diff.find(this._model).create();
  }

  protected _setModel() {
    this._store.setCallType(this._model.intent);
    this._store.setAction(this._model.action);
    this._store.setShowFav(this._model.showFav);
    this._store.setDefaultTab(this._model.defaultTab);
    this._store.setVisibleTabs(this._model.visibleTabs);
    this._store.setShownFields(this._model.visibleFields);
  }

  protected async _updateAction(action: ClickAction) {
    await this._store.setAction(action);
  }

  protected async _updateIntent(intent: CallType) {
    await this._store.setCallType(intent);
  }

  protected ngDoCheck() {
    if (!this._diffRecorder) {
      return ;
    }
    const diff = this._diffRecorder.diff(<any>this._model);
    if (diff) {
      this._setModel();
    }
  }
}
