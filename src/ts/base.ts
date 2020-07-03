import {EventEmitter, Injector, Provider, SimpleChanges, TemplateRef, Injectable, ComponentFactoryResolver, ApplicationRef, EmbeddedViewRef, ComponentRef, Input, Directive} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {CycleType, METADATA, NgInject, NgCycle} from './decorators';
import {Logger, LoggingInstance} from './services/logging';
import {Loading} from './components/loading';
import {Contact} from './models';
import {VCardMetadata, VCardParser} from './lib/src';
import {MatSnackBar} from '@angular/material/snack-bar';
import {filter, distinctUntilChanged, map} from 'rxjs/operators';
import {Navigation} from './services/navigation';

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
  @NgInject(MatSnackBar) private __modal__: MatSnackBar;

  public get view(): any {
    return this;
  }

  private __cycles__: Map<string, Array<string>> = new Map<string, Array<string>>();
  private __subscriptions__: Array<Subscription> = [];

  protected _isValid: boolean = true;

  constructor() {
    super();
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
    this.__modal__.open(message, '', {duration: 3000});
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

  @NgCycle('init')
  private __initMe__() {
    this.metadata = this.contact.metadata.find(m => m.vcardId == this.vcardId) || null;
    if (!this.metadata) {
      this.metadata = VCardParser.newMetadata(this.vcardId);
      this.contact.metadata.push(this.metadata);
    }

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
