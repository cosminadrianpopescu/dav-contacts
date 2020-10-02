import {ScrollingModule} from '@angular/cdk/scrolling';
import {Injector, NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatBadgeModule} from '@angular/material/badge';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PreloadAllModules, RouteReuseStrategy, RouterModule} from '@angular/router';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {CallLog} from '@ionic-native/call-log/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {WebIntent} from '@ionic-native/web-intent/ngx';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {NoKeyboardModule} from 'ionic-no-keyboard';
import {Spinner, Statics} from '../base';
import {Avatar} from '../components/avatar';
import {Contact} from '../components/contact';
import {ContactsList} from '../components/contacts-list';
import {Dialpad} from '../components/dialpad';
import {Groups} from '../components/groups';
import {History as HistoryPage} from '../components/history';
import {Loading} from '../components/loading';
import {NumberSelector} from '../components/number-selector';
import {SideMenu} from '../components/side-menu';
import {Toolbar} from '../components/toolbar';
import {CallLog2History} from '../convertors/call-log-to-history';
import {ContactClick} from '../directives/contact-click';
import {LongPress} from '../directives/long-press';
import {AddServer} from '../pages/add-server';
import {Dialer} from '../pages/dialer';
import {Home} from '../pages/home';
import {Main as MainComponent} from '../pages/main';
import {Tiles} from '../pages/tiles';
import * as pipes from '../pipes';
import {routes} from '../routing/main';
import {Dav} from '../services/dav';
import {Dialer as DialerService} from '../services/dialer';
import {History} from '../services/history';
import {Navigation} from '../services/navigation';
import {Sort} from '../services/sort';
import {Store} from '../services/store';
import {Playground} from '../pages/playground';
import { SingleInput } from '../components/single-input';
import {SingleChoice} from '../components/single-choice';
import { MultipleText } from '../components/multiple-text';
import { Structured } from '../components/structured';
import {StructuredMultiple} from '../components/structured-multiple';
import { Binary } from '../components/binary';
import {FileChooser} from '@ionic-native/file-chooser/ngx';
import {FileService} from '../services/file';
import {Details} from '../pages/details';
import { Settings } from '../pages/settings';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { CheckboxGroup } from '../components/checkbox-group';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Swipe } from '../directives/swipe';
import {Nextcloud} from '../nextcloud/nextcloud';
import {Webdav} from '../nextcloud/webdav';

@NgModule({
  declarations: [
    MainComponent, Home, Toolbar, pipes.RouteData, SideMenu, Contact,
    pipes.ContactName, pipes.ContactPhone, pipes.FilteredContacts, pipes.ContactPhoto,
    Dialer, AddServer, Loading, Dialpad, pipes.AsHtml, LongPress, HistoryPage,
    ContactsList, NumberSelector, ContactClick, pipes.FilteringCallableItem,
    pipes.ContactsForTag, pipes.IsFavorite, Avatar, Tiles, pipes.ContactInitials,
    pipes.ContactColor, pipes.HighlightedName, pipes.ContactTags, Groups,
    Playground, SingleInput, SingleChoice, MultipleText, pipes.OptionValue, Structured,
    StructuredMultiple, pipes.DisplayableValues, pipes.PhoneNumber, Binary, Details,
    Settings, CheckboxGroup, pipes.IsChecked, Swipe,
  ],
  entryComponents: [Home, SideMenu, NumberSelector,],
  imports: [
    MatSelectModule, MatFormFieldModule, FormsModule, MatInputModule,
    BrowserModule, IonicModule.forRoot(), MatToolbarModule, MatSidenavModule,
    MatCardModule, MatGridListModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatTabsModule, 
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true }),
    BrowserAnimationsModule, NoKeyboardModule, MatListModule, MatMenuModule,
    MatBottomSheetModule, MatRadioModule, MatExpansionModule, MatChipsModule,
    ScrollingModule, MatDialogModule, MatBadgeModule, MatSnackBarModule,
    MatSlideToggleModule, MatCheckboxModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    StatusBar,
    SplashScreen, Dav, Store, Navigation, History, Spinner, DialerService,
    WebIntent, AndroidPermissions, CallLog, Sort, CallLog2History,
    FileChooser, FileService, Nextcloud, Webdav,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [MainComponent]
})
export class Main {
  constructor(injector: Injector) {
    Statics.injector = injector;
  }
}
