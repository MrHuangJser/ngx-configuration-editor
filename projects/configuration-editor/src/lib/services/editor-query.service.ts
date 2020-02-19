import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { EditorStore, IEditorState } from './editor.store';

@Injectable()
export class EditorStoreQuery extends Query<IEditorState> {
  width$ = this.select('width');
  height$ = this.select('height');
  scale$ = this.select('scale');
  background$ = this.select('background');
  items$ = this.select('items');

  constructor(protected store: EditorStore) {
    super(store);
  }
}
