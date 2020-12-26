import {Routes} from '@angular/router';
import {Details} from '../pages/details';
import {Dialer} from '../pages/dialer';
import {Home} from '../pages/home';
import {Playground} from '../pages/playground';
import {Settings} from '../pages/settings';

export const routes: Routes = [
  {path: 'dial', component: Dialer, data: {title: 'Dialpad'}},
  {path: 'history', component: Dialer, data: {title: 'History and call log', 'no-dialpad': true}},
  {path: 'playground', component: Playground, data: {title: 'Playground'}},
  {path: 'details/edit/:contactId', component: Details, data: {title: 'Contact details'}},
  {path: 'details/add/:number', component: Details, data: {title: 'Contact details'}},
  {path: 'details/:contactId', component: Details, data: {title: 'Contact details'}},
  {path: 'settings', component: Settings, data: {title: 'Settings'}},
  {path: '', component: Home, data: {title: 'Contacts', withSearch: true}}
];
