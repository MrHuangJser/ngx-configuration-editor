import { Injectable } from '@angular/core';
import { Store } from '@datorama/akita';
import { ISelectedItemPercentState, ISelectState } from '../interface';

export interface ISelectorState {
  selected: Set<string>;
  bordered: Set<string>;
  selectorLeft: number;
  selectorTop: number;
  selectorWidth: number;
  selectorHeight: number;
  showResizeHandle: boolean;
  startSelectorState: ISelectState | null;
  startSelectItemState: Map<string, ISelectState & ISelectedItemPercentState> | null;
}

@Injectable()
export class SelectorStore extends Store<ISelectorState> {
  constructor() {
    super(
      { selected: new Set<string>(), bordered: new Set<string>(), showResizeHandle: true, startSelectItemState: null, startSelectorState: null },
      { name: `ce-editor-selector-${Math.round(Math.random() * 100000)}`, resettable: true }
    );
  }
}
