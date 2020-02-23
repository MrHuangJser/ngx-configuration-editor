import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { IEditorState } from '../interface';
import { EditorStore } from './editor.store';

@Injectable()
export class EditorStoreQuery extends Query<IEditorState> {
  width$ = this.select('width');
  height$ = this.select('height');
  left$ = this.select('left');
  top$ = this.select('top');
  scale$ = this.select('scale');
  background$ = this.select('background');
  items$ = this.select('items');

  constructor(protected store: EditorStore) {
    super(store);
  }
}
