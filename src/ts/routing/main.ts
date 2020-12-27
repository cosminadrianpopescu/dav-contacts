import {Routes} from '@angular/router';
import {Details} from '../pages/details';
import {Home} from '../pages/home';
import {Playground} from '../pages/playground';
import {Settings} from '../pages/settings';
import {Dialpad} from '../components/dialpad';
import {SelectContact} from '../pages/select-contact';

export const routes: Routes = [
  {path: 'dial', component: Dialpad, data: {title: ''}},
  {path: 'playground', component: Playground, data: {title: 'Playground'}},
  {path: 'details/edit/:contactId', component: Details, data: {title: 'Contact details'}},
  {path: 'details/edit/:contactId/:new-number', component: Details, data: {title: 'Contact details'}},
  {path: 'details/add/:number', component: Details, data: {title: 'Contact details'}},
  {path: 'details/:contactId', component: Details, data: {title: 'Contact details'}},
  {path: 'settings', component: Settings, data: {title: 'Settings'}},
  {path: 'select/:number', component: SelectContact, data: {withSearch: true, title: 'Select a contact'}},
  {path: '', component: Home, data: {title: 'Contacts', withSearch: true}}
];
