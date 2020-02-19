import { Store, StoreConfig } from '@datorama/akita';

export interface ISelectorState {
  selected: Set<string>;
  bordered: Set<string>;
  selectorLeft: number;
  selectorTop: number;
  selectorWidth: number;
  selectorHeight: number;
}

@StoreConfig({ name: 'ce-editor-selector', resettable: true })
export class SelectorStore extends Store<ISelectorState> {
  constructor() {
    super({ selected: new Set<string>(), bordered: new Set<string>() });
  }
}
