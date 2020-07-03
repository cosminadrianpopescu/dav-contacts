import {BehaviorSubject} from 'rxjs';

export class Search {
  public static notify$: BehaviorSubject<string> = new BehaviorSubject<string>('');
}
