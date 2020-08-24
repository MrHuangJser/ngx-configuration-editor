import { Injectable, TemplateRef } from '@angular/core';
import { action } from '@datorama/akita';
import { add, divide, multiply, subtract } from 'mathjs';
import { Subject } from 'rxjs';
import { AlignDirection, EditorEventsType, IEditorState, ItemFormData } from './interface';
import { EditorStore } from './services/editor.store';
import { SelectorStore } from './services/selector.store';
import { UtilsService } from './services/utils.service';

@Injectable({
  providedIn: 'root',
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
    this.selectorStore.update({ bordered: new Set(flag ? [...bordered, ...ids] : [...bordered].filter((id) => !ids.includes(id))) });
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
    this.selectorStore.update({ selected: new Set(flag ? [...selected, ...ids] : [...selected].filter((id) => !ids.includes(id))) });
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
      Object.keys(itemsStateMap).forEach((id) => {
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
                y: state.y ? multiply(divide(state.y, height), 100) : item.styleProps.transform.position.y,
              },
            },
          },
        };
      });
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
          style: { width: itemsClientBoxPercent.width, height: itemsClientBoxPercent.height, zIndex: Object.keys(items).length - ids.length || 1 },
          transform: { position: { x: itemsClientBoxPercent.left, y: itemsClientBoxPercent.top }, scale: 1, rotate: 0 },
        },
        children: ids.map((id, index) => {
          const item = items[id];
          const {
            styleProps: {
              style,
              transform: {
                position: { x, y },
              },
            },
          } = item;
          return {
            ...item,
            styleProps: {
              ...item.styleProps,
              style: {
                ...style,
                width: multiply(divide(style.width, itemsClientBoxPercent.width), 100),
                height: multiply(divide(style.height, itemsClientBoxPercent.height), 100),
              },
              transform: {
                ...item.styleProps.transform,
                position: {
                  x: multiply(divide(subtract(x, itemsClientBoxPercent.left), itemsClientBoxPercent.width), 100),
                  y: multiply(divide(subtract(y, itemsClientBoxPercent.top), itemsClientBoxPercent.height), 100),
                },
              },
            },
          } as ItemFormData;
        }),
      };
      this.editorStore.update({
        items: {
          [newItem.id]: newItem,
          ...Object.keys(items)
            .filter((id) => !ids.includes(id))
            .reduce((obj, id) => ({ ...obj, [id]: items[id] }), {}),
        },
      });
      this.selectorStore.update({ bordered: new Set([newItem.id]), selected: new Set([newItem.id]) });
    }
  }

  @action('ce-editor:breakUpItem')
  breakUpItem(id: string) {
    const { items, width, height } = this.editorStore.getValue();
    const item = items[id];
    if (item.children && item.children.length) {
      const newItems: { [id: string]: ItemFormData } = {};
      item.children.forEach((children, index) => {
        const {
          styleProps: {
            style: { width: childWidth, height: childHeight },
            transform: {
              position: { x: childX, y: childY },
            },
          },
        } = children;
        const {
          styleProps: {
            style: { width: itemWidth, height: itemHeight, zIndex },
            transform: {
              position: { x: itemX, y: itemY },
            },
          },
        } = item;
        newItems[children.id] = {
          ...children,
          styleProps: {
            ...children.styleProps,
            style: {
              ...children.styleProps.style,
              zIndex: zIndex + index,
              width: multiply(itemWidth, divide(childWidth, 100)),
              height: multiply(itemHeight, divide(childHeight, 100)),
            },
            transform: {
              ...children.styleProps.transform,
              position: {
                x: add(multiply(divide(childX, 100), itemWidth), itemX),
                y: add(multiply(divide(childY, 100), itemHeight), itemY),
              },
            },
          },
        } as ItemFormData;
      });
      this.editorStore.update({
        items: {
          ...newItems,
          ...Object.keys(items).reduce((obj, key) => ({ ...obj, ...(id !== key ? { [key]: { ...items[key] } } : {}) }), {}),
        },
      });
      this.selectorStore.update({
        bordered: new Set(Object.keys(newItems)),
        selected: new Set(Object.keys(newItems)),
      });
    }
  }

  @action('ce-editor:deleteItems')
  deleteItems(ids: string[]) {
    const { items } = this.editorStore.getValue();
    return this.editorStore.update({
      items: Object.keys(items)
        .filter((id) => !ids.includes(id))
        .reduce((obj, id) => ({ ...obj, [id]: { ...items[id] } }), {}),
    });
  }

  @action('ce-editor:addItems')
  addItems(newItems: { [id: string]: ItemFormData }) {
    const { items, width, height } = this.editorStore.getValue();
    const itemsLength = Object.keys(items).length;
    const batchItems: { [id: string]: ItemFormData } = {};
    const tempItems: { [id: string]: ItemFormData } = {};
    Object.values(newItems).forEach((item, index) => {
      item.styleProps.style.zIndex = itemsLength + index + 1;
      if (item.usePercent) {
        batchItems[item.id] = { ...item };
      } else {
        tempItems[item.id] = { ...item };
      }
    });
    this.editorStore.update({ items: { ...items, ...batchItems, ...this.utilsSrv.convertItemsToPercent(tempItems, width, height) } });
  }
}
