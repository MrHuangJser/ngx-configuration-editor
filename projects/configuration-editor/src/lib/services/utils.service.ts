import { Injectable } from '@angular/core';
import { CoordinatesService } from './coordinates.service';
import { EditorStore } from './editor.store';
import { SelectorStore } from './selector.store';

interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

@Injectable()
export class UtilsService {
  constructor(private coordinatesSrv: CoordinatesService, private editorStore: EditorStore, private selectorStore: SelectorStore) {}

  pointIsInRect(point: [number, number], rect: IRect) {
    const { x, y, w, h } = rect;
    const [px, py] = point;
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  rectIsContainerRect(child: IRect, parent: IRect) {
    const { x: cx, y: cy, w: cw, h: ch } = child;
    return this.pointIsInRect([cx, cy], parent) && this.pointIsInRect([cx + cw, cy + ch], parent);
  }

  getItemRects(ids: string[]) {
    return ids.map<Partial<DOMRect>>(id => {
      const { scale } = this.editorStore.getValue();
      const itemRect = document.querySelector(`[ce-item-id="${id}"]`).getBoundingClientRect();
      const [left, top] = this.coordinatesSrv.clientToCanvas(itemRect.left, itemRect.top);
      return { left, top, width: itemRect.width / scale, height: itemRect.height / scale };
    });
  }

  getItemsClientBox(ids: string[]) {
    const selectedRects = this.getItemRects(ids);
    const left = Math.min(...selectedRects.map(rect => rect.left));
    const top = Math.min(...selectedRects.map(rect => rect.top));
    return {
      left,
      top,
      width: Math.max(...selectedRects.map(rect => rect.left + rect.width)) - left,
      height: Math.max(...selectedRects.map(rect => rect.top + rect.height)) - top
    };
  }

  getItemClientBoxByPercent(ids: string[]) {
    const { width: canvasWidth, height: canvasHeight } = this.editorStore.getValue();
    const { left, top, width, height } = this.getItemsClientBox(ids);
    return {
      left: (left / canvasWidth) * 100,
      top: (top / canvasHeight) * 100,
      width: (width / canvasWidth) * 100,
      height: (height / canvasHeight) * 100
    };
  }
}
