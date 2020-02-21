import { Injectable } from '@angular/core';
import { add, divide, multiply, subtract } from 'mathjs';
import { BaseDirection, ISelectedItemPercentState, ISelectState } from '../interface';
import { CoordinatesService } from './coordinates.service';
import { EditorStore } from './editor.store';

@Injectable()
export class UtilsService {
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
    const { scale } = this.editorStore.getValue();
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
        left: isRotate ? left : item.styleProps.transform.position.x,
        top: isRotate ? top : item.styleProps.transform.position.y,
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
}
