import { BaseTestUnit } from '../base';
import {NgTest} from '../decorators';

export class TestingTest extends BaseTestUnit {
  @NgTest()
  public testing() {
    console.log('we have a test case');
  }
}
