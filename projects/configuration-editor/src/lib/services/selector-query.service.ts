import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ISelectorState, SelectorStore } from './selector.store';

@Injectable()
export class SelectorQueryService extends Query<ISelectorState> {
  left$ = this.select('selectorLeft');
  top$ = this.select('selectorTop');
  width$ = this.select('selectorWidth');
  height$ = this.select('selectorHeight');
  selected$ = this.select('selected');
  bordered$ = this.select('bordered');

  constructor(protected store: SelectorStore) {
    super(store);
  }
}
