import * as dav from 'dav';
import {Convertor} from './decorators';
import {VCardParser, VCardMetadata} from './lib/src';
import {AddressBook, Contact} from './models';

export class ContactConverter implements Convertor<Contact> {
  public convert(src: dav.VCard): Contact {
    const result = new Contact();
    result.url = src.url;
    result.etag = src.etag;
    result.metadata = VCardParser.parse(src.addressData);

    return result;
  }
}

export class AddressBookConverter implements Convertor<AddressBook> {
  public convert(src: dav.AddressBook): AddressBook {
    const result = new AddressBook();
    const conv = new ContactConverter();
    result.href = src.url;
    result.name = src.displayName;
    result.contacts = src.objects.map(c => conv.convert(c))

    return result;
  }
}

export class VCardConverter implements Convertor<string> {
  public convert(metadata: Array<VCardMetadata>): string {
    return VCardParser.stringify(metadata);
  }
}
