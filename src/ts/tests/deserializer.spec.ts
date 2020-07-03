import {BaseTestUnit} from '../base';
import {NgTest, deserialize, Convertor} from '../decorators';
import {ModelFactory} from '../models';

class ToBeConverted {
  p1: string;
  p2: string;
}

class DummyConvertor implements Convertor<ToBeConverted> {
  public convert(src: {a1: any; a2: any;}): ToBeConverted {
    const result = new ToBeConverted();
    result.p1 = src.a1;
    result.p2 = src.a2;
    return result;
  }
}

class Contact {
  url: string;
  etag: string;
  @deserialize('date')
  d: Date;
  @deserialize(DummyConvertor)
  conv: ToBeConverted;
}

class AddressBook {
  public name: string;
  public href: string;
  @deserialize(Contact)
  public contacts: Array<Contact>;
}

export class DeserializerTest extends BaseTestUnit {
  
  @NgTest()
  public testDeserializer() {
    const json = {
      href: 'href',
      name: 'name', 
      contacts: [
        {url: 'url1', etag: 'etag1', d: 'Tue May 19 2020 09:14:45 GMT+0200 (Central European Summer Time)'},
        {url: 'url2', etag: 'etag2', d: null, conv: {a1: 'a1', a2: 'a2'}}
      ],
    }

    const obj: AddressBook = ModelFactory.instance(json, AddressBook) as AddressBook;
    expect(obj instanceof AddressBook).toBeTruthy();
    expect(obj.contacts[0].d instanceof Date).toBeTruthy();
    expect(obj.contacts[1].d).toBeNull();
    expect(obj.contacts[1].conv instanceof ToBeConverted).toBeTruthy();
    expect(obj.contacts[1].conv.p1).toEqual('a1');
  }
}
