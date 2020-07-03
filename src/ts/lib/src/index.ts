// Structured properties (like ADR, or N)
export class VCardStructuredProperty {
  value: string; // The value of the nested property
  label: string;
  priority: number;
}

export class VCardMetadata {
  vcardId: string; // It's the vcard field name (like N, FN, EMAIL, TEL etc.)
  priority?: number; // A display priority (can be safely ignored)
  label?: string; // A human readable label to display for the field
  value?: string | Array<VCardStructuredProperty>; // The actual value (if it's a single value)
  values?: Array<{type?: string, value: string | Array<VCardStructuredProperty>}>; // The actual values, if there are multiple values for this field
  options?: Array<{key: string, label: string}>; // The list of options to choose from if it's a field with choices (like GENDER)
}

const singleText = {
	'FN:10': 'Full name',
	'FULLNAME:10': 'Full name',
	'BDAY:60': 'Birth day',
	'NICKNAME:50': 'Nickname',
	'GEO': 'Location',
	'NOTE:70': 'Note',
	'ROLE': 'Role',
	'TITLE': 'title',
	'TZ': 'Timezone',
	'UID': 'UID',
	'VERSION': 'Version',
    'RELATIONSHIP': 'Relationship',
	'ORG': 'Organization',
    'X-ADDRESSBOOKSERVER-KIND': 'Kind',
	'CATEGORIES:80': 'Tags',
    type: 'single-input',
};

const singleChoice = {
    'GENDER': 'Gender;F:Female;M:Male',
    type: 'single-choice',
}

const multipleText = {
    'LANG': 'Languages',
    'TEL:20': 'Phones',
    'EMAIL:30': 'Email',
    'IMPP': 'Instant messenging',
    'URL': 'Websites',
    'RELATED': 'Related',
    type: 'multiple-text',
};

const singleBinary = {
	'KEY': 'Key',
	'LOGO': 'Logo',
	'PHOTO': 'Picture',
	'SOUND': 'Sound',
    type: 'single-binary',
};

const singleStructured = {
    'N:5': 'Name;Last name:30;First name:20;Middle name:40;Prefix:0;Suffix:50',
    type: 'structured',
}

const multipleStructured = {
  'ADR:40': 'Address;Box:20;Second line:30;First line:10;City:50;State:50;Post code:40;Country:60',
  type: 'structured-multiple',
}

export class VCardParser {
  // This will split the line between the field name and the value
  private static linePattern = /^([^:]+):(.*)$/g;
  // Will return the actual key in one of the fields list (like singleText or singleChoice etc.)
  private static getKey = (key: string, where: Object) => Array.from(Object.keys(where)).find(k => k.match(new RegExp(`^${key}`)));
  // Will extract the priority from above mentioned found key (if it exists, or 10000 otherwise)
  private static priority = (key: string) => key.match(VCardParser.linePattern) ? parseInt(key.replace(VCardParser.linePattern, '$2')) : 10000;
  // Will create a base Vcard object, containing the priority, the value and the vcardId.
  private static baseVcard = (line: string, key: string, id: string) => {
    const result = new VCardMetadata();
    result.priority = VCardParser.priority(key);
    result.value = line.replace(VCardParser.linePattern, '$2');
    result.vcardId = id;
    return result;
  }
  private static structured = (value: string, key: string, where: Object): Array<VCardStructuredProperty> => {
    const r = /^([^;]+);(.*)$/g;
    const values = value.split(';');
    const labels = where[key].replace(r, '$2').split(';');
    return values.map((v, idx) => {
      return {value: v, label: labels[idx].replace(VCardParser.linePattern, '$1'), priority: VCardParser.priority(labels[idx])};
    });
  }



  // Returns true if the key is found in one of the fields list (like singleText or singleChoice etc.)
  private static _isIn(key: string, where: Object): boolean {
    return Array.from(Object.keys(where)).map(k => k.replace(/^([^:]+):?.*$/, '$1')).indexOf(key) != -1;
  }

  private static _newSingleText(line: string, key: string, id: string, source?: Object): VCardMetadata {
    const result = VCardParser.baseVcard(line, key, id);
    result.label = (source || singleText)[key];
    return result;
  }

  private static _newSingleChoice(line: string, key: string, id: string): VCardMetadata {
    const result = VCardParser.baseVcard(line, key, id);
    const parts: Array<string> = singleChoice[key].split(';');
    result.label = parts[0];
    // Also extract the options out of it.
    result.options = parts.slice(1).map(p => {
      const r = /^([^:]+):(.*)$/g;
      return {label: p.replace(r, '$2'), key: p.replace(r, '$1')};
    });

    return result;
  }

  private static _newSingleStructured(line: string, key: string, id: string): VCardMetadata {
    const result = VCardParser.baseVcard(line, key, id);
    const r = /^([^;]+);(.*)$/g;
    result.label = singleStructured[key].replace(r, '$1');
    (result.value as Array<VCardStructuredProperty>) = VCardParser.structured(result.value as string, key, singleStructured);
    return result;
  }

  private static _newMultipleStructured(line: string, key: string, id: string, data: Array<VCardStructuredProperty>, type: string): VCardMetadata {
    const result = VCardParser.baseVcard(line, key, id);
    result.label = multipleStructured[key].replace(/^([^;]+);.*$/g, '$1');
    result.values = [{type: type, value: data}];
    result.value = null;
    return result;
  }

  private static _newSingleBinary(line: string, key: string, id: string): VCardMetadata {
    const result = VCardParser.baseVcard(line, key, id);
    result.label = singleBinary[key];
    return result;
  }

  public static newMultipleStructured(vcardId: string): {type: string, value: Array<VCardStructuredProperty>} {
    const key = VCardParser.getKey(vcardId, multipleStructured);
    const data = VCardParser.structured(multipleStructured[key].replace(/^[^;]+;/, ''), key, multipleStructured);
    data.forEach(v => v.value = null);

    return {type: null, value: data};
  }

  public static newMetadata(vcardId: string): VCardMetadata {
    let result: VCardMetadata;
    if (VCardParser._isIn(vcardId, singleText)) {
      const key = VCardParser.getKey(vcardId, singleText);
      result = VCardParser._newSingleText(`${vcardId}:`, key, vcardId);
    }
    else if (VCardParser._isIn(vcardId, singleChoice)) {
      const key = VCardParser.getKey(vcardId, singleChoice);
      result = VCardParser._newSingleChoice(`${vcardId}:`, key, vcardId);
    }
    else if (VCardParser._isIn(vcardId, multipleText)) {
      const key = VCardParser.getKey(vcardId, multipleText);
      result = VCardParser._newSingleText(`${vcardId}:`, key, vcardId, multipleText);
      result.values = [];
      result.value = null;
    }
    else if (VCardParser._isIn(vcardId, singleStructured)) {
      const key = VCardParser.getKey(vcardId, singleStructured);
      result = VCardParser.baseVcard(`${vcardId}:`, key, vcardId);
      const r = /^([^;]+);(.*)$/g;
      result.label = singleStructured[key].replace(r, '$1');
      result.value = singleStructured[key].replace(r, '$2');
      (result.value as Array<VCardStructuredProperty>) = VCardParser.structured(result.value as string, key, singleStructured);
      (result.value as Array<VCardStructuredProperty>).sort((a, b) => a.priority - b.priority).forEach(v => v.value = '');
      return result;
    }
    else if (VCardParser._isIn(vcardId, multipleStructured)) {
      const key = VCardParser.getKey(vcardId, multipleStructured);
      result = VCardParser._newSingleText(`${vcardId}:`, key, vcardId);
      result.label = multipleStructured[key].replace(/^([^;]+);.*/, '$1');
      result.values = [];
    }
    else if (VCardParser._isIn(vcardId, singleBinary)) {
      const key = VCardParser.getKey(vcardId, singleBinary);
      result = VCardParser._newSingleBinary(`${vcardId}:`, key, vcardId);
      result.value = null;
    }

    return result;
  }

  public static getType(key: string): string {
    if (key == 'CATEGORIES') {
      return 'tags';
    }
    if (VCardParser._isIn(key, singleText)) {
      return singleText.type;
    }

    if (VCardParser._isIn(key, singleChoice)) {
      return singleChoice.type;
    }

    if (VCardParser._isIn(key, multipleText)) {
      return multipleText.type;
    }

    if (VCardParser._isIn(key, singleBinary)) {
      return singleBinary.type;
    }

    if (VCardParser._isIn(key, singleStructured)) {
      return singleStructured.type;
    }

    if (VCardParser._isIn(key, multipleStructured)) {
      return multipleStructured.type;
    }
  }

  public static parse(data: string): Array<VCardMetadata> {
    // Split the lines
    const lines = data.split(/\r\n(?=\S)|\r(?=\S)|\n(?=\S)/);
    const result: Array<VCardMetadata> = [];
    lines
      // filter out all lines which begin with an item or which are empty
      .filter(l => !l.replace(/[\r\n]/g, '').match(/^item\d+\.|\r\n\s*|\r\s*|\n\s*/gi))
      .map(l => l.replace(/\n /g, '').replace(/\r/g, ''))
      .map(l => l.replace(/[\r\n]/g, ''))
      .forEach(line => {
        // Get the id of the field
        const id = line.replace(/^([^:;]+)[;:].*$/g, '$1');
        let key: string;
        let m: VCardMetadata;
        // If it's a single text, 
        if (VCardParser._isIn(id, singleText)) {
          key = VCardParser.getKey(id, singleText);
          result.push(VCardParser._newSingleText(line, key, id));
        }
        // If it's a single text with choice
        else if (VCardParser._isIn(id, singleChoice)) {
          key = VCardParser.getKey(id, singleChoice);
          result.push(VCardParser._newSingleChoice(line, key, id));
        }
        // If it's a multiple, 
        else if (VCardParser._isIn(id, multipleText)) {
          const pref = line.replace(VCardParser.linePattern, '$1');
          // Check out the type of the current line
          let type: string = null;
          if (id != pref) {
            type = line.replace(/["']/g, '').replace(/^[^;]+;(TYPE|VALUE)=([^:]+):.*$/g, '$2').replace(/^([^;]+);.*$/g, '$1');
          }
          // Then search to see if we already added another value with the same key.
          m = result.find(r => r.vcardId == id);
          if (!m) {
            // If not, create a new one
            key = VCardParser.getKey(id, multipleText);
            m = VCardParser.baseVcard(line, key, id);
            m.label = multipleText[key];
            m.values = [{type: type, value: m.value}];
            m.value = null;
            result.push(m);
          }
          else {
            // If so, just push the new value in the list of values.
            m.values.push({type: type, value: line.replace(VCardParser.linePattern, '$2')});
          }
        }
        else if (VCardParser._isIn(id, singleBinary)) {
          const type = line.replace(new RegExp(`${id};ENCODING=[a-z]+;TYPE=([^;:]+)[;:].*$`), '$1');
          key = VCardParser.getKey(id, singleBinary);
          m = VCardParser._newSingleBinary(line, key, id);
          m.value = `data:${id == 'PHOTO' ? 'image' : id == 'SOUND' ? 'audio' : 'application'}/${type};base64,${(m.value as string).replace(/ /g, '')}`;
          result.push(m);
        }
        else if (VCardParser._isIn(id, singleStructured)) {
          key = VCardParser.getKey(id, singleStructured);
          m = VCardParser._newSingleStructured(line, key, id);
          result.push(m);
        }
        else if (VCardParser._isIn(id, multipleStructured)) {
          const pref = line.replace(VCardParser.linePattern, '$1');
          // Check out the type of the current line
          let type: string = null;
          if (id != pref) {
            type = line.replace(/^[^;]+;(TYPE|VALUE)=([^:]+):.*$/g, '$2');
          }
          // Then search to see if we already added another value with the same key.
          m = result.find(r => r.vcardId == id);
          key = VCardParser.getKey(id, multipleStructured);
          const data = VCardParser.structured(line.replace(VCardParser.linePattern, '$2'), key, multipleStructured);
          if (!m) {
            // If not, create a new one
            result.push(VCardParser._newMultipleStructured(line, key, id, data, type));
          }
          else {
            // If so, just push the new value in the list of values.
            m.values.push({type: type, value: data});
          }
        }
        else {
          // m = baseVcard(line, key, id);
          // m.label = m.vcardId;
        }
      });
    return result;
  }

  private static _format(s: string): string {
    return s.split('\n')
      .reduce((acc, v) => {
        acc += acc == '' ? '' : '\n'
        if (v.length <= 75) {
          return acc + v;
        }
        let idx = 75;
        let lines = v.substr(0, idx);
        while (idx < v.length) {
          lines += '\n ' + v.substr(idx, 74);
          idx += 74;
        }
        return acc + lines;
      }, '');
  }

  private static getStructured(id: string, values: Array<VCardStructuredProperty>): string {
    const key = VCardParser.getKey(id, singleStructured);
    const parts: Array<string> = singleStructured[key].split(';').splice(1);
    return parts.reduce((acc, _v, idx) => {
      const x = values.find(v => _v.match(new RegExp(`^${v.label}`)));
      const pref = acc + (idx == 0 ? '' : ';');
      if (!x) {
        return pref;
      }

      return pref + x.value;
    }, '');
  }

  public static stringify(data: Array<VCardMetadata>): string {
    const result = data.
      reduce((acc, v) => {
        if ((this._isIn(v.vcardId, singleText) || this._isIn(v.vcardId, singleChoice)) && v.value) {
          acc += v.vcardId + ':' + v.value + '\n';
        }
        else if (this._isIn(v.vcardId, multipleText) && Array.isArray(v.values) && v.values.length > 0) {
          acc += v.values.reduce((acc, v2) => acc + v.vcardId + (v2.type ? ';TYPE=' + v2.type : '') + ':' + v2.value + "\n", '');
        }
        else if (this._isIn(v.vcardId, singleBinary) && v.value != null) {
          const p = /^data:[^\/]+\/([^;]+);base64,(.*)$/g;
          let line = v.vcardId + ';ENCODING=b;TYPE=' + (v.value as string).replace(/^data:[^\/]+\/([^;]+);.*$/g, '$1') + ':';
          const b = (v.value as string).replace(p, '$2');
          line += b;
          // let idx = 75 - line.length;
          // line += b.substr(0, idx);
          // while (idx < b.length) {
          //   line += '\n ' + b.substr(idx, 74);
          //   idx += 74;
          // }
          acc += line + '\n';
        }
        else if (this._isIn(v.vcardId, singleStructured) && Array.isArray(v.value) && v.value.length > 0) {
          acc += v.vcardId + ':' + VCardParser.getStructured(v.vcardId, v.value) + '\n';
        }
        else if (this._isIn(v.vcardId, multipleStructured) && Array.isArray(v.values) && v.values.length > 0) {
          acc += v.values.reduce((acc, v2) => {
            return acc + v.vcardId + (v2.type ? ';TYPE=' + v2.type : '') + ':' +
              VCardParser.getStructured(v.vcardId, v2.value as Array<VCardStructuredProperty>) + '\n';
          }, '');
        }
        return acc;
      }, 'BEGIN:VCARD\n') + 'END:VCARD';

    return VCardParser._format(result);
  }
}
