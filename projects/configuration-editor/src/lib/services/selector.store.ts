import { Injectable } from '@angular/core';
import { Store } from '@datorama/akita';

export interface ISelectorState {
  selected: Set<string>;
  bordered: Set<string>;
  selectorLeft: number;
  selectorTop: number;
  selectorWidth: number;
  selectorHeight: number;
}

@Injectable()
export class SelectorStore extends Store<ISelectorState> {
  constructor() {
    super(
      { selected: new Set<string>(), bordered: new Set<string>() },
      { name: `ce-editor-selector-${Math.round(Math.random() * 100000)}`, resettable: true }
    );
  }
}
