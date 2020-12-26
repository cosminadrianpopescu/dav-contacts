import {ApplicationRef, ComponentFactoryResolver, ComponentRef, Directive, EmbeddedViewRef, EventEmitter, Injectable, Injector, Input, Provider, SimpleChanges, TemplateRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {Observable, Subscription} from 'rxjs';
import {Loading} from './components/loading';
import {CycleType, METADATA, NgCycle, NgInject} from './decorators';
import {VCardMetadata, VCardParser} from './lib/src';
import {Contact, ModelFactory, STRUCTURED} from './models';
import {Logger, LoggingInstance} from './services/logging';

export class Statics {
  public static injector: Injector;
  public static validatorTemplate: TemplateRef<any>;
}

class BaseClassWithDecorations {
  protected __resolveDecorations__(protoName: string, component: any, callback: Function) {
    if (component.name == '') {
      return ;
    }
    const values: Map<string, Array<Object>> = METADATA.get(component) || new Map<string, Array<Object>>();
    if (Array.isArray(values.get(protoName))) {
      values.get(protoName).forEach(<any>callback.bind(this));
    }

    this.__resolveDecorations__(protoName, component.__proto__, callback);
  }

  protected __resolveInjectors__() {
    this.__resolveDecorations__('__injectors__', this.constructor, (obj: Object) => this[obj['prop']] = Statics.injector.get(obj['arg']));
  }
}

export class BaseClass extends BaseClassWithDecorations {
  public static UUID(): string {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  protected _logger: Logger = LoggingInstance.logger;

  constructor() {
    super();
    this.__resolveInjectors__();
  }
}

@Injectable()
export class Spinner extends BaseClass {
  @NgInject(<any>ComponentFactoryResolver) private _resolver: ComponentFactoryResolver;
  @NgInject(ApplicationRef) private _app: ApplicationRef;
  private _component: ComponentRef<any> = null;

  public async show(): Promise<void> {
    if (this._component) {
      return ;
    }

    this._component = this._resolver.resolveComponentFactory(Loading).create(Statics.injector);
    this._app.attachView(this._component.hostView);
    const node = (this._component.hostView as EmbeddedViewRef<any>).rootNodes[0];
    document.body.appendChild(node);
  }

  public async hide(): Promise<void> {
    if (!this._component) {
      return ;
    }
    this._app.detachView(this._component.hostView);
    this._component.destroy();
    this._component = null;
  }
}

export class BaseComponent extends BaseClass {
  @NgInject(Router) protected _router: Router;
  @NgInject(Spinner) private _spinner: Spinner;
  @NgInject(MessageService) private _toast: MessageService;
  protected id: string;

  public get view(): any {
    return this;
  }

  private __cycles__: Map<string, Array<string>> = new Map<string, Array<string>>();
  private __subscriptions__: Array<Subscription> = [];

  protected _isValid: boolean = true;

  constructor() {
    super();
    this.id = BaseClass.UUID();
    this.__resolveDecorations__('__cycles__', this.constructor, (obj: Object) => {
      if (!this.__cycles__.get(obj['arg'])) {
        this.__cycles__.set(obj['arg'], []);
      }
      this.__cycles__.get(obj['arg']).push(obj['prop']);
    });
  }

  private _runCycle(cycle: CycleType, args?: any) {
    const cycles = [].concat(this.__cycles__.get(cycle) || []);
    cycles.reverse().forEach(method => this[method](args));
  }

  private ngOnDestroy() {
    this._runCycle('destroy');
    this.__subscriptions__.forEach(s => s.unsubscribe());
  }

  private ngAfterViewInit() {
    this._runCycle('afterViewInit');
  }

  private ngOnChanges(changes: SimpleChanges) {
    this._runCycle('change', changes);
  }

  protected async _handleError(err: Error) {
    await this.hideLoading();
    console.error(err);
    this.alert(err.message || err['error'] || err.name || err.constructor.name);
  }

  private async ngOnInit() {
    this._runCycle('init');
  }

  protected connect<T>(obs: Observable<T>, callback: (t: T) => void) {
    this.__subscriptions__.push(obs.subscribe(callback));
  }

  protected navigate(url: string): Promise<boolean>{
    return this._router.navigateByUrl(url);
  }

  protected async showLoading() {
    await this._spinner.show();
  }

  protected async hideLoading() {
    await this._spinner.hide();
  }

  protected get isJobPage(): boolean {
    return this._router.url.match(/job$/) ? true : false;
  }

  protected alert(message: string) {
    this._toast.add({severity: 'success', detail: message, key: 'abc', sticky: false});
  }
}

@Directive({
  selector: 'dav-base-input-component',
})
export class BaseInputComponent extends BaseComponent {
  @Input() public readOnly: boolean = false;
  @Input() public contact: Contact;
  @Input() public vcardId: string;
  @Input() public inputType: string;

  @NgInject(<any>ComponentFactoryResolver) private _resolver: ComponentFactoryResolver;

  protected _selector: string = null;

  constructor() {
    super();

    const factory = this._resolver.resolveComponentFactory(<any>this.constructor);
    this._selector = factory.selector;
  }
}

@Directive({
  selector: 'dav-base-input-with-metadata-component',
})
export class BaseInputWithMetadata extends BaseInputComponent {
  protected metadata: VCardMetadata;

  private _getContactMetadata(c: Contact, vcardId: string): VCardMetadata {
    if (!vcardId.match(/[#:]/g)) {
      return c.metadata.find(m => m.vcardId == vcardId);
    }

    if (vcardId.match(/#/)) {
      const [id, type] = vcardId.split('#');

      let result = ModelFactory.instance(c.metadata.find(m => m.vcardId == id), VCardMetadata) as VCardMetadata;
      const values = result.values.find(v => v.type == type);

      result.label = `${result.label} ${type}`;
      result.value = values.value;
      result.values = null;

      return result;
    }

    const parts = vcardId.split(':');
    console.log('card id is', vcardId);

    return ModelFactory.instance(<VCardMetadata>{
      vcardId: `X-${STRUCTURED}`, label: 'Misc',
      value: c.metadata
        .filter(m => parts.indexOf(m.vcardId) != -1)
        .map(m => ({label: m.label, value: m.value}))
    }, VCardMetadata) as VCardMetadata;
  }

  @NgCycle('init')
  private __initMe__() {
    this.metadata = this._getContactMetadata(this.contact, this.vcardId) || null;
    if (!this.metadata) {
      this.metadata = VCardParser.newMetadata(this.vcardId);
      this.contact.metadata.push(this.metadata);
    }

    console.log('metadata is', this.metadata);

    if (this.inputType != 'number') {
      return ;
    }

    const p = /[^0-9\.\+]/g;

    if (this.metadata.value && !Array.isArray(this.metadata.value)) {
      this.metadata.value = this.metadata.value.replace(p, '');
    }

    if (Array.isArray(this.metadata.values)) {
      this.metadata.values.filter(v => !Array.isArray(v.value)).forEach(v => v.value = (v.value as string).replace(p, ''));
    }
  }
}

@Directive({
  selector: 'dav-base-multiple-text',
})
export class BaseMultipleText extends BaseInputWithMetadata {
  protected types: Array<string> = [];
}

export class BaseTestUnit extends BaseClassWithDecorations {
  protected initialized = new EventEmitter();
  constructor(private _providers: Array<Provider>) {
    super();
  }

  private __init__() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({providers: this._providers});
    Statics.injector = TestBed;
    this.__resolveInjectors__();
    this.initialized.emit();
  }
}
