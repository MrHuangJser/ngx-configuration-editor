import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { EditorStore, IState } from './editor.store';

@Injectable()
export class EditorStoreQuery extends Query<IState> {
  width$ = this.select('width');
  height$ = this.select('height');
  scale$ = this.select('scale');
  background$ = this.select('background');
  items$ = this.select('items');

  constructor(protected store: EditorStore) {
    super(store);
  }
}
