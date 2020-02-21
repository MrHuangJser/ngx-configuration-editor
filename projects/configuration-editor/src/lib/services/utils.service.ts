import { Injectable } from '@angular/core';
import { divide, multiply } from 'mathjs';
import { CoordinatesService } from './coordinates.service';
import { EditorStore } from './editor.store';
import { SelectorStore } from './selector.store';

@Injectable()
export class UtilsService {
  constructor(private coordinatesSrv: CoordinatesService, private editorStore: EditorStore, private selectorStore: SelectorStore) {}

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
}
