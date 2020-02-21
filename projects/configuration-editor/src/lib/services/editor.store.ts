import { Injectable } from '@angular/core';
import { Store } from '@datorama/akita';
import { Subject, Subscription } from 'rxjs';
import { bufferWhen, debounceTime } from 'rxjs/operators';
import { ItemFormData } from '../interface';
import { SelectorStore } from './selector.store';

export interface IEditorState {
  width: number;
  height: number;
  scale: number;
  left: number;
  top: number;
  background: string | null;
  items: { [id: string]: ItemFormData };
}

function createInitialState(): IEditorState {
  return {
    width: 1000,
    height: 800,
    scale: 0.7,
    left: 0,
    top: 0,
    background: null,
    items: {}
  };
}

@Injectable()
export class EditorStore extends Store<IEditorState> {
  private stateHistory: { past: IEditorState[]; future: IEditorState[] } = {
    past: [],
    future: []
  };
  private stateChange$ = new Subject<IEditorState>();
  private subscription = new Subscription();

  constructor(private selectorStore: SelectorStore) {
    super(createInitialState(), { name: `ce-editor-${Math.round(Math.random() * 100000)}` });
    this.subscription.add(
      this.stateChange$.pipe(bufferWhen(() => this.stateChange$.pipe(debounceTime(300)))).subscribe(states => {
        this.stateHistory.future = [];
        this.stateHistory.past.push({ ...states.shift() });
      })
    );
  }

  akitaPreUpdate(prevState: IEditorState, nextState: IEditorState) {
    this.stateChange$.next(prevState);
    return nextState;
  }

  destroy() {
    this.subscription.unsubscribe();
    this.selectorStore.reset();
    super.destroy();
  }

  reset() {
    super.reset();
    this.selectorStore.reset();
    this.stateHistory = { past: [], future: [] };
  }

  redo() {
    if (this.stateHistory.future.length) {
      const state = this.stateHistory.future.pop();
      this.stateHistory.past.push(this.getValue());
      this._setState({ ...state }, true);
    }
  }

  undo() {
    if (this.stateHistory.past.length) {
      const state = this.stateHistory.past.pop();
      this.stateHistory.future.push(this.getValue());
      this._setState({ ...state }, true);
    }
  }
}
