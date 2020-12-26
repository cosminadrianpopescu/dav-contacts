import {Pipe} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {merge, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {BaseClass} from './base';
import {Panel} from './components/wrappers/panel';
import {NgInject} from './decorators';
import {VCardMetadata, VCardStructuredProperty} from './lib/src';
import {Contact, FilteringItem, History, KeyValue, LabelValue, NO_TAG} from './models';
import {Dav} from './services/dav';
import {Navigation} from './services/navigation';
import {Search} from './services/search';

@Pipe({name: 'routeData'})
export class RouteData extends BaseClass {
  @NgInject(Navigation) private _service: Navigation;
  public transform(prop: string): Observable<string | number | boolean> {
    return this._service.routeData$.pipe(map(data => data[prop]))
  }
}

@Pipe({name: 'contactName'})
export class ContactName extends BaseClass {
  @NgInject(Dav) private _service: Dav;
  public transform(c: Contact): string {
    if (!c) {
      return '';
    }
    return this._service.getContactName(c);
  }
}

@Pipe({name: 'highlightedName'})
export class HighlightedName extends BaseClass {
  public transform(name: string): Observable<string> {
    return Search.notify$.pipe(
      map(text => {
        if (!text) {
          return name;
        }

        return name.replace(new RegExp(`(${text})`, 'i'), '<span style="color: var(--primary-color);">$1</span>');
      })
    );
  }
}

@Pipe({name: 'contactPhone'})
export class ContactPhone extends BaseClass {
  public transform(c: Contact): string {
    const m = c.metadata.find(c => c.vcardId == 'TEL');
    if (!m) {
      return '';
    }

    const mobile = m.values.find(v => ['mobile', 'cell'].indexOf(v.type ? v.type.toLowerCase() : '') != -1);
    if (mobile) {
      return mobile.value as string;
    }

    if (m.values.length > 0) {
      return m.values[0].value as string;
    }

    return '';
  }
}

@Pipe({name: 'filteredContacts'})
export class FilteredContacts extends BaseClass {
  @NgInject(Dav) private _service: Dav;
  transform(contacts: Array<Contact>): Observable<Array<Contact>> {
    if (!Array.isArray(contacts)) {
      return of([]);
    }

    const result = contacts.filter(c => {
      const kind = c.metadata.find(m => m.vcardId == 'X-ADDRESSBOOKSERVER-KIND');
      if (!kind) {
        return true;
      }

      return kind.value != 'GROUP';
    });

    return merge(of(result), Search.notify$).pipe(
      map(x => {
        if (typeof(x) == 'string' && x) {
          return result
            .map(c => <Object>{c: c, name: this._service.getContactName(c)})
            .filter(obj => obj['name'].toLowerCase().indexOf(x.toLowerCase()) != -1)
            .map(obj => obj['c']);
        }

        return result;
      })
    )
  }
}

@Pipe({name: 'contactPhoto'})
export class ContactPhoto extends BaseClass {
  transform(c: Contact): string {
    if (!c) {
      return null;
    }
    const m = c.metadata.find(m => m.vcardId == 'PHOTO');
    if (!m) {
      return null;
    }

    return m.value as string;
  }
}

@Pipe({name: 'asHtml'})
export class AsHtml extends BaseClass {
  @NgInject(<any>DomSanitizer) private _sanitizer: DomSanitizer;
  transform(s: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(s);
  }
}

@Pipe({name: 'filteringCallableItem'})
export class FilteringCallableItem extends BaseClass {
  @NgInject(Dav) private _dav: Dav;
  transform(item: FilteringItem): string | Contact {
    if (item.original instanceof Contact) {
      return item.original;
    }

    const h: History = item.original;

    if (!h.uid) {
      return h.number;
    }

    const c = this._dav.contactById(h.uid);
    if (c) return c;

    return h.number;
  }
}

@Pipe({name: 'contactsForTag'})
export class ContactsForTag extends BaseClass {
  @NgInject(Dav) private _service: Dav;
  
  transform(tag: string, _param?: any): Array<Contact> {
    return this._service.contactsByTag(tag == NO_TAG ? null : tag);
  }
}

@Pipe({name: 'isFavorite'})
export class IsFavorite extends BaseClass {
  @NgInject(Dav) private _service: Dav;

  public transform(c: Contact): boolean {
    return this._service.isFavorite(c);
  }
}

@Pipe({name: 'contactInitials'})
export class ContactInitials extends BaseClass {
  @NgInject(Dav) private _service: Dav;
  public transform(c: Contact): string {
    if (!c) {
      return '';
    }
    const name = this._service.getContactName(c);
    return name.replace(/(.)[^ ]+ ?(.)?.*$/g, '$1$2').toUpperCase();
  }
}

@Pipe({name: 'contactColor'})
export class ContactColor extends BaseClass {
  @NgInject(Dav) private _dav: Dav;
  public transform(c: Contact): string {
    if (!c) {
      return '';
    }

    return this._dav.avatarColor(c);
  }
}

@Pipe({name: 'contactTags'})
export class ContactTags extends BaseClass {
  @NgInject(Dav) private _dav: Dav;
  transform(c: Contact): Array<string> {
    return this._dav.getContactTags(c);
  }
}

@Pipe({name: 'optionValue'})
export class OptionValue extends BaseClass {
  transform(m: VCardMetadata, _value?: string): string {
    if (!m || !m.value) {
      return '';
    }

    const o = m.options.find(o => o.key == m.value);
    return o ? o.label : '';
  }
}

@Pipe({name: 'displayableValues'})
export class DisplayableValues extends BaseClass {
  transform(values: Array<VCardStructuredProperty> | {type: string, value: Array<VCardStructuredProperty>}): Array<VCardStructuredProperty> {
    return (Array.isArray(values) ? values : values.value).filter(v => !!v.value);
  }
}

@Pipe({name: 'phoneNumber'})
export class PhoneNumber extends BaseClass {
  transform(phone: string): string {
    return phone.replace(/[^0-9\.\+]/g, '');
  }
}

@Pipe({name: 'isChecked'})
export class IsChecked extends BaseClass {
  transform(option: KeyValue, model: Array<string>): boolean {
    return model.map(x => String(x)).indexOf(option.key) != -1;
  }
}

@Pipe({name: 'fieldTitle'})
export class FieldTitle {
  public transform(m: VCardMetadata): string {
    if (!m) {
      return '';
    }
    return m.label;
  }
}

@Pipe({name: 'hasAdd'})
export class HasAdd {
  public transform(selector: string, ro: boolean): boolean {
    return !ro && ['dav-multiple-text', 'dav-structured-multiple'].indexOf(selector) != -1;
  }
}

@Pipe({name: 'asOptions'})
export class AsOptions {
  public transform(types: Array<string>): Array<LabelValue> {
    return types.map(t => <LabelValue>{label: t, value: t});
  }
}

@Pipe({name: 'toValueLabel'})
export class ToValueLabel {
  public transform(options: Array<{key: string, label: string}>): Array<LabelValue> {
    return options.map(o => <LabelValue>{label: o.label, value: o.key});
  }
}

@Pipe({name: 'isCollapsed'})
export class IsCollapsed {
  public transform(p: Panel): Observable<boolean> {
    return merge(of(true), p.collapsed$);
  }
}
