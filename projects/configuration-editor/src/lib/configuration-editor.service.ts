import { Injectable, TemplateRef } from '@angular/core';
import { action } from '@datorama/akita';
import { divide, multiply, subtract } from 'mathjs';
import { Subject } from 'rxjs';
import { AlignDirection, EditorEventsType, ItemFormData } from './interface';
import { EditorStore, IEditorState } from './services/editor.store';
import { SelectorStore } from './services/selector.store';
import { UtilsService } from './services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationEditorService {
  events$ = new Subject<EditorEventsType>();
  private itemViewTpl: TemplateRef<void>;

  constructor(public editorStore: EditorStore, public selectorStore: SelectorStore, public utilsSrv: UtilsService) {}

  getItemViewTpl() {
    return this.itemViewTpl;
  }
  setItemViewTpl(tpl: TemplateRef<void>) {
    this.itemViewTpl = tpl;
  }

  @action('ce-editor:setStore')
  setStore(state: Partial<IEditorState>) {
    this.editorStore.update({ ...state, items: this.utilsSrv.convertItemsToPercent(state.items, state.width, state.height) });
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

  @action('ce-editor:alignSelected')
  alignItems(direction: AlignDirection, ids: string[]) {
    if (ids.length) {
      const { items, width, height } = this.editorStore.getValue();
      const itemsStateMap = this.utilsSrv.getAlignMoveStateFromDirection(direction, ids);
      const batchItems: { [id: string]: ItemFormData } = {};
      for (const id in itemsStateMap) {
        if (itemsStateMap.hasOwnProperty(id)) {
          const state = itemsStateMap[id];
          const item = items[id];
          batchItems[id] = {
            ...item,
            styleProps: {
              ...item.styleProps,
              transform: {
                ...item.styleProps.transform,
                position: {
                  x: state.x ? multiply(divide(state.x, width), 100) : item.styleProps.transform.position.x,
                  y: state.y ? multiply(divide(state.y, height), 100) : item.styleProps.transform.position.y
                }
              }
            }
          };
        }
      }
      this.editorStore.update({ items: { ...items, ...batchItems } });
    }
  }

  @action('ce-editor:groupItems')
  groupItems(ids: string[]) {
    if (ids.length > 1) {
      const { items } = this.editorStore.getValue();
      const itemsClientBoxPercent = this.utilsSrv.getItemClientBoxByPercent(ids);
      const newItem: ItemFormData = {
        id: `${Date.now()}_${Math.round(Math.random() * 1000000)}`,
        usePercent: true,
        styleProps: {
          style: { width: itemsClientBoxPercent.width, height: itemsClientBoxPercent.height, zIndex: Object.keys(items).length - ids.length },
          transform: { position: { x: itemsClientBoxPercent.left, y: itemsClientBoxPercent.top }, scale: 1, rotate: 0 }
        },
        children: ids.map((id, index) => {
          const item = items[id];
          const {
            styleProps: {
              style,
              transform: {
                position: { x, y }
              }
            }
          } = item;
          return {
            ...item,
            styleProps: {
              ...item.styleProps,
              style: {
                ...style,
                zIndex: index + 1,
                width: multiply(divide(style.width, itemsClientBoxPercent.width), 100),
                height: multiply(divide(style.height, itemsClientBoxPercent.height), 100)
              },
              transform: {
                ...item.styleProps.transform,
                position: {
                  x: multiply(divide(subtract(x, itemsClientBoxPercent.left), itemsClientBoxPercent.width), 100),
                  y: multiply(divide(subtract(y, itemsClientBoxPercent.top), itemsClientBoxPercent.height), 100)
                }
              }
            }
          } as ItemFormData;
        })
      };
      const newItems: { [id: string]: ItemFormData } = {};
      for (const id in items) {
        if (items.hasOwnProperty(id)) {
          if (!ids.includes(id)) {
            newItems[id] = { ...items[id] };
          }
        }
      }
      this.editorStore.update({ items: { ...newItems, [newItem.id]: newItem } });
      this.selectorStore.update({ bordered: new Set([newItem.id]), selected: new Set([newItem.id]) });
    }
  }
}
