import { Injectable } from '@angular/core';
import { action } from '@datorama/akita';
import { EditorStore, IEditorState } from './services/editor.store';
import { SelectorStore } from './services/selector.store';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationEditorService {
  public editorId: string;

  constructor(private editorStore: EditorStore, private selectorStore: SelectorStore) {}

  @action('ce-editor:setStore')
  setStore(state: Partial<IEditorState>) {
    this.editorStore.update({ ...state });
  }

  @action('ce-editor:reset')
  reset() {
    this.editorStore.reset();
  }

  @action('ce-editor:redo')
  redo() {
    this.editorStore.redo();
  }

  @action('ce-editor:undo')
  undo() {
    this.editorStore.undo();
  }

  @action('ce-editor:moveCanvas')
  moveCanvas(x: number, y: number) {
    this.editorStore.update({ left: x, top: y });
  }

  @action('ce-editor:scaleCanvas')
  scaleCanvas(delta: number, center: [number, number] | null) {
    const { scale, left, top } = this.editorStore.getValue();
    const [x, y] = center || [left, top];
    const newScale = scale + delta;
    if (newScale <= 4 && newScale >= 0.2) {
      this.editorStore.update({ scale: newScale, left: (left - x) * (delta / scale) + left, top: (top - y) * (delta / scale) + top });
    }
  }

  @action('ce-editor:showSelector')
  showSelector(x: number, y: number, width: number, height: number) {
    this.selectorStore.update({ selectorLeft: x, selectorTop: y, selectorWidth: width, selectorHeight: height });
  }

  @action('ce-editor:toggleBorder')
  toggleBorder(id: string, flag = true) {
    this.selectorStore.update(({ bordered }) => {
      flag ? bordered.add(id) : bordered.delete(id);
      return { bordered: new Set(bordered) };
    });
  }

  @action('ce-editor:toggleBorderBatch')
  showBorderBatch(ids: string[], flag = true) {
    this.selectorStore.update(({ bordered }) => {
      return { bordered: new Set(flag ? [...bordered, ...ids] : [...bordered].filter(id => !ids.includes(id))) };
    });
  }
}
