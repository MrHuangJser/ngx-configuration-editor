import { Injectable, TrackByFunction } from '@angular/core';
import { add, divide, multiply, subtract } from 'mathjs';
import { BaseDirection, ISelectedItemPercentState, ISelectState, ItemFormData } from '../interface';
import { CoordinatesService } from './coordinates.service';
import { EditorStore } from './editor.store';

@Injectable()
export class UtilsService {
  itemsTrackBy: TrackByFunction<ItemFormData> = (_i, item) => item.id;
  constructor(private coordinatesSrv: CoordinatesService, private editorStore: EditorStore) {}

  pointIsInRect(point: [number, number], rect: Partial<DOMRect>) {
    const { left, top, width, height } = rect;
    const [px, py] = point;
    return px >= left && px <= left + width && py >= top && py <= top + height;
  }

  rectIsContainerRect(child: Partial<DOMRect>, parent: Partial<DOMRect>) {
    const { left: cx, top: cy, width: cw, height: ch } = child;
    return this.pointIsInRect([cx, cy], parent) && this.pointIsInRect([cx + cw, cy + ch], parent);
  }

  getItemRects(ids: string[]) {
    const { scale, width, height } = this.editorStore.getValue();
    const { items } = this.editorStore.getValue();
    return ids.map<Partial<DOMRect>>(id => {
      const item = items[id];
      const itemDOM = document.querySelector(`[ce-item-id="${id}"]`);
      if (!item || !itemDOM) {
        return null;
      }
      const itemRect = itemDOM.getBoundingClientRect();
      const isRotate = item.styleProps.transform.rotate;
      const [left, top] = this.coordinatesSrv.clientToCanvas(itemRect.left, itemRect.top);
      return {
        left: isRotate ? left : multiply(divide(item.styleProps.transform.position.x, 100), width),
        top: isRotate ? top : multiply(divide(item.styleProps.transform.position.y, 100), height),
        width: divide(itemRect.width, scale),
        height: divide(itemRect.height, scale)
      };
    });
  }

  getItemsClientBox(ids: string[]) {
    const selectedRects = this.getItemRects(ids);
    const left = Math.min(...selectedRects.map(rect => rect && rect.left));
    const top = Math.min(...selectedRects.map(rect => rect && rect.top));
    if (!left || !top) {
      return null;
    }
    return {
      left,
      top,
      width: Math.max(...selectedRects.map(rect => rect.left + rect.width)) - left,
      height: Math.max(...selectedRects.map(rect => rect.top + rect.height)) - top
    };
  }

  getItemClientBoxByPercent(ids: string[]) {
    const itemsClientBox = this.getItemsClientBox(ids);
    if (!itemsClientBox) {
      return null;
    }
    const { left, top, width, height } = itemsClientBox;
    const { width: canvasWidth, height: canvasHeight } = this.editorStore.getValue();
    return {
      left: multiply(divide(left, canvasWidth), 100),
      top: multiply(divide(top, canvasHeight), 100),
      width: multiply(divide(width, canvasWidth), 100),
      height: multiply(divide(height, canvasHeight), 100)
    };
  }

  baseDirectionResize(
    direction: BaseDirection,
    [mx, my]: [number, number],
    startSelectorState: ISelectState,
    startSelectItemState: Map<string, ISelectState & ISelectedItemPercentState>
  ) {
    const { items } = this.editorStore.getValue();
    const itemStateMap = {};
    const { left, top, width, height } = startSelectorState;
    startSelectItemState.forEach((state, id) => {
      const item = items[id];
      const { leftPercent, topPercent, widthPercent, heightPercent } = state;
      let newSelectorHeight: any;
      let newSelectorWidth: any;
      switch (direction) {
        case 'e':
          newSelectorWidth = add(width, mx);
          itemStateMap[id] = {
            ...item,
            styleProps: {
              ...item.styleProps,
              style: {
                ...item.styleProps.style,
                width: multiply(widthPercent, newSelectorWidth)
              },
              transform: {
                ...item.styleProps.transform,
                position: {
                  ...item.styleProps.transform.position,
                  x: add(multiply(newSelectorWidth, leftPercent), left)
                }
              }
            }
          };
          break;
        case 'n':
          newSelectorHeight = subtract(height, my);
          itemStateMap[id] = {
            ...item,
            styleProps: {
              ...item.styleProps,
              style: {
                ...item.styleProps.style,
                height: multiply(heightPercent, newSelectorHeight)
              },
              transform: {
                ...item.styleProps.transform,
                position: {
                  ...item.styleProps.transform.position,
                  y: add(add(multiply(newSelectorHeight, topPercent), top), my)
                }
              }
            }
          };
          break;
        case 's':
          newSelectorHeight = add(height, my);
          itemStateMap[id] = {
            ...item,
            styleProps: {
              ...item.styleProps,
              style: {
                ...item.styleProps.style,
                height: multiply(heightPercent, newSelectorHeight)
              },
              transform: {
                ...item.styleProps.transform,
                position: {
                  ...item.styleProps.transform.position,
                  y: add(multiply(newSelectorHeight, topPercent), top)
                }
              }
            }
          };
          break;
        case 'w':
          newSelectorWidth = subtract(width, mx);
          itemStateMap[id] = {
            ...item,
            styleProps: {
              ...item.styleProps,
              style: {
                ...item.styleProps.style,
                width: multiply(widthPercent, newSelectorWidth)
              },
              transform: {
                ...item.styleProps.transform,
                position: {
                  ...item.styleProps.transform.position,
                  x: add(add(multiply(newSelectorWidth, leftPercent), left), mx)
                }
              }
            }
          };
          break;
      }
    });
    return itemStateMap;
  }

  getAlignMoveStateFromDirection(direction: string, ids: string[]) {
    const itemsStateMap: { [id: string]: { x?: number; y?: number } } = {};
    const itemsRect = this.getItemRects(ids);
    const minX = Math.min(...itemsRect.map(rect => rect.left));
    const minY = Math.min(...itemsRect.map(rect => rect.top));
    const maxX = Math.max(...itemsRect.map(rect => rect.left + rect.width));
    const maxY = Math.max(...itemsRect.map(rect => rect.top + rect.height));
    const middleX = (maxX - minX) / 2 + minX;
    const middleY = (maxY - minY) / 2 + minY;
    ids.forEach((id, index) => {
      const rect = itemsRect[index];
      switch (direction) {
        case 'left':
          itemsStateMap[id].x = minX;
          break;
        case 'top':
          itemsStateMap[id] = { y: minY };
          break;
        case 'right':
          itemsStateMap[id] = { x: maxX - rect.width };
          break;
        case 'bottom':
          itemsStateMap[id] = { y: maxY - rect.height };
          break;
        case 'horizontal':
          itemsStateMap[id] = { x: middleX - rect.width / 2 };
          break;
        case 'vertical':
          itemsStateMap[id] = { y: middleY - rect.height / 2 };
          break;
      }
    });
    const sortedItems = itemsRect.map((rect, index) => ({ ...rect, id: ids[index] }));
    sortedItems.sort((a, b) => {
      switch (direction) {
        case 'distribute-horizontal':
          return a.left - b.left;
        case 'distribute-vertical':
          return a.top - b.top;
      }
    });
    const gutter =
      sortedItems.reduce((sum, item, index) => {
        if (index !== 0) {
          switch (direction) {
            case 'distribute-horizontal':
              sum += item.left - sortedItems[index - 1].left - sortedItems[index - 1].width;
              break;
            case 'distribute-vertical':
              sum += item.top - sortedItems[index - 1].top - sortedItems[index - 1].height;
              break;
          }
        }
        return sum;
      }, 0) /
      (sortedItems.length - 1);

    let prevItem: any;
    sortedItems.forEach((item, index) => {
      if (index !== 0 && index !== sortedItems.length - 1) {
        switch (direction) {
          case 'distribute-horizontal':
            const left = prevItem.left + prevItem.width + gutter;
            itemsStateMap[item.id] = { x: left };
            prevItem = { ...item, left };
            break;
          case 'distribute-vertical':
            const top = prevItem.top + prevItem.height + gutter;
            itemsStateMap[item.id] = { y: top };
            prevItem = { ...item, top };
            break;
        }
      } else {
        prevItem = item;
      }
    });
    return itemsStateMap;
  }

  setItemPercent(item: ItemFormData, parentWidth: number, parentHeight: number) {
    const { usePercent } = item;
    const { width, height } = item.styleProps.style;
    const { x, y } = item.styleProps.transform.position;
    const itemWidth = usePercent ? width : multiply(divide(width, parentWidth), 100);
    const itemHeight = usePercent ? height : multiply(divide(height, parentHeight), 100);
    const itemLeft = usePercent ? x : multiply(divide(x, parentWidth), 100);
    const itemTop = usePercent ? y : multiply(divide(y, parentHeight), 100);
    const children = item.children ? this.mapItemChildren(item.children, itemWidth, itemHeight) : null;
    return {
      ...item,
      children,
      usePercent: true,
      styleProps: {
        ...item.styleProps,
        style: {
          ...item.styleProps.style,
          width: itemWidth,
          height: itemHeight
        },
        transform: {
          ...item.styleProps.transform,
          position: {
            x: itemLeft,
            y: itemTop
          }
        }
      }
    };
  }

  mapItemChildren(list: ItemFormData[], parentWidth: number, parentHeight: number): ItemFormData[] {
    return list.map<ItemFormData>(item => this.setItemPercent(item, parentWidth, parentHeight));
  }

  convertItemsToPercent(items: { [id: string]: ItemFormData }, width: number, height: number): { [id: string]: ItemFormData } {
    const newItems: { [id: string]: ItemFormData } = {};
    Object.keys(items).forEach(id => {
      const item = items[id];
      newItems[id] = { ...this.setItemPercent(item, width, height) };
    });
    return newItems;
  }
}
