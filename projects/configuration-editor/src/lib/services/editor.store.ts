import { action, Store, StoreConfig } from '@datorama/akita';
import { ItemFormData } from '../interface';

export interface IState {
  width: number;
  height: number;
  scale: number;
  left: number;
  top: number;
  background: string | null;
  items: ItemFormData[];
}

function createInitialState(): IState {
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
export class EditorStore extends Store<IState> {
  private stateHistory: { past: IState[]; future: IState[] } = {
    past: [],
    future: []
  };

  constructor() {
    super(createInitialState());
  }

  akitaPreUpdate(prevState: IState, nextState: IState) {
    this.stateHistory.past.push(prevState);
    this.stateHistory.future = [];
    return nextState;
  }

  @action('ce-editor:redo')
  redo() {
    if (this.stateHistory.future.length) {
      const state = this.stateHistory.future.pop();
      this.stateHistory.past.push(state);
      this._setState(state);
    }
  }

  @action('ce-editor:undo')
  undo() {
    if (this.stateHistory.past.length) {
      const state = this.stateHistory.past.pop();
      this.stateHistory.future.push(state);
      this._setState(state);
    }
  }
}
