import { Store, StoreConfig } from '@datorama/akita';
import { ItemFormData } from '../interface';
import { SelectorStore } from './selector.store';

export interface IEditorState {
  width: number;
  height: number;
  scale: number;
  left: number;
  top: number;
  background: string | null;
  items: ItemFormData[];
}

function createInitialState(): IEditorState {
  return {
    width: 1000,
    height: 800,
    scale: 0.7,
    left: 0,
    top: 0,
    background: null,
    items: []
  };
}

@StoreConfig({ name: 'ce-editor', resettable: true })
export class EditorStore extends Store<IEditorState> {
  private stateHistory: { past: IEditorState[]; future: IEditorState[] } = {
    past: [],
    future: []
  };

  constructor(private selectorStore: SelectorStore) {
    super(createInitialState());
  }

  akitaPreUpdate(prevState: IEditorState, nextState: IEditorState) {
    this.stateHistory.past.push(prevState);
    this.stateHistory.future = [];
    return nextState;
  }

  reset() {
    super.reset();
    this.selectorStore.reset();
    this.stateHistory = { past: [], future: [] };
  }

  redo() {
    if (this.stateHistory.future.length) {
      const state = this.stateHistory.future.pop();
      this.stateHistory.past.push(state);
      this._setState(state);
    }
  }

  undo() {
    if (this.stateHistory.past.length) {
      const state = this.stateHistory.past.pop();
      this.stateHistory.future.push(state);
      this._setState(state);
    }
  }
}
