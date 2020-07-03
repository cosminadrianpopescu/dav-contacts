import {Routes} from '@angular/router';
import {Home} from '../pages/home';
import {Dialer} from '../pages/dialer';
import {AddServer} from '../pages/add-server';
import { Playground } from '../pages/playground';
import { Details } from '../pages/details';
import { Settings } from '../pages/settings';

export const routes: Routes = [
  {path: 'add-server', component: AddServer, data: {title: 'Server'}},
  {path: 'dial', component: Dialer, data: {title: 'Dialpad'}},
  {path: 'history', component: Dialer, data: {title: 'History and call log', 'no-dialpad': true}},
  {path: 'playground', component: Playground, data: {title: 'Playground'}},
  {path: 'details/edit/:contactId', component: Details, data: {title: 'Contact details'}},
  {path: 'details/add/:number', component: Details, data: {title: 'Contact details'}},
  {path: 'details/:contactId', component: Details, data: {title: 'Contact details'}},
  {path: 'settings', component: Settings, data: {title: 'Settings'}},
  {path: '', component: Home, data: {title: 'Contacts', withSearch: true}}
];
