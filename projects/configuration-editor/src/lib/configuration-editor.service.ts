import { Injectable, TemplateRef } from '@angular/core';
import { action } from '@datorama/akita';
import { ItemFormData } from './interface';
import { EditorStore, IEditorState } from './services/editor.store';
import { SelectorStore } from './services/selector.store';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationEditorService {
  editorId: string;
  private itemViewTpl: TemplateRef<void>;

  constructor(public editorStore: EditorStore, public selectorStore: SelectorStore) {}

  getItemViewTpl() {
    return this.itemViewTpl;
  }
  setItemViewTpl(tpl: TemplateRef<void>) {
    this.itemViewTpl = tpl;
  }

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
    const { bordered, selected } = this.selectorStore.getValue();
    if (flag) {
      bordered.add(id);
    } else {
      if (!selected.has(id)) {
        bordered.delete(id);
      }
    }
    this.selectorStore.update({ bordered: new Set([...bordered]) });
  }

  @action('ce-editor:toggleBorderBatch')
  toggleBorderBatch(ids: string[], flag = true) {
    const { bordered } = this.selectorStore.getValue();
    this.selectorStore.update({ bordered: new Set(flag ? [...bordered, ...ids] : [...bordered].filter(id => !ids.includes(id))) });
  }

  @action('ce-editor:clearBorder')
  clearBorder() {
    this.selectorStore.update({ bordered: new Set<string>() });
  }

  @action('ce-editor:toggleSelector')
  toggleSelector(id: string, flag = true) {
    const { selected } = this.selectorStore.getValue();
    flag ? selected.add(id) : selected.delete(id);
    this.selectorStore.update({ selected: new Set([...selected]) });
  }

  @action('ce-editor:toggleSelectorBatch')
  toggleSelectorBatch(ids: string[], flag = true) {
    const { selected } = this.selectorStore.getValue();
    this.selectorStore.update({ selected: new Set(flag ? [...selected, ...ids] : [...selected].filter(id => !ids.includes(id))) });
  }

  @action('ce-editor:clearSelector')
  clearSelector() {
    this.selectorStore.update({ selected: new Set<string>() });
  }

  @action('ce-editor:updateItemBatch')
  updateItemBatch(itemsStateMap: { [id: string]: ItemFormData }) {
    const { items } = this.editorStore.getValue();
    this.editorStore.update({ items: { ...items, ...itemsStateMap } });
  }
}
