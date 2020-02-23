import { Injectable } from '@angular/core';
import { applyTransaction, Query } from '@datorama/akita';
import { divide, subtract } from 'mathjs';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfigurationEditorService } from '../configuration-editor.service';
import { ISelectedItemPercentState, ISelectState } from '../interface';
import { CoordinatesService } from './coordinates.service';
import { EditorStore } from './editor.store';
import { ISelectorState, SelectorStore } from './selector.store';
import { UtilsService } from './utils.service';

@Injectable()
export class SelectorQueryService extends Query<ISelectorState> {
  left$ = this.select('selectorLeft');
  top$ = this.select('selectorTop');
  width$ = this.select('selectorWidth');
  height$ = this.select('selectorHeight');
  selected$ = this.select('selected');
  bordered$ = this.select('bordered');
  showResizeHandle$ = this.select('showResizeHandle');

  private subscription = new Subscription();
  constructor(
    protected store: SelectorStore,
    private editorSrv: ConfigurationEditorService,
    private editorStore: EditorStore,
    private coordinatesSrv: CoordinatesService,
    private utilsSrv: UtilsService
  ) {
    super(store);
    this.subscription.add(
      this.select(['selectorLeft', 'selectorTop', 'selectorWidth', 'selectorHeight'])
        .pipe(
          filter(({ selectorHeight, selectorLeft, selectorTop, selectorWidth }) => !!(selectorHeight && selectorLeft && selectorTop && selectorWidth))
        )
        .subscribe(({ selectorHeight, selectorLeft, selectorTop, selectorWidth }) => {
          const { items, scale } = this.editorStore.getValue();
          for (const id in items) {
            if (items.hasOwnProperty(id)) {
              const [selectorX, selectorY] = this.coordinatesSrv.editorToCanvas(selectorLeft, selectorTop);
              const item = items[id];
              const [itemRect] = this.utilsSrv.getItemRects([id]);
              const selectorRect = {
                left: selectorX,
                top: selectorY,
                width: divide(selectorWidth, scale),
                height: divide(selectorHeight, scale)
              };
              const flag = this.utilsSrv.rectIsContainerRect(itemRect, selectorRect);
              applyTransaction(() => {
                this.editorSrv.toggleBorder(item.id, flag);
                this.editorSrv.toggleSelector(item.id, flag);
              });
            }
          }
        })
    );
  }

  private getSelectedItems() {
    const { items } = this.editorStore.getValue();
    const { selected } = this.store.getValue();
    return [...selected].map(id => items[id]);
  }

  setResizeHandleVisible(visible: boolean) {
    this.store.update({ showResizeHandle: visible });
  }

  setStartSelectState(event: PointerEvent | null) {
    applyTransaction(() => {
      if (event) {
        const { selected } = this.store.getValue();
        const ids = [...selected];

        const startSelectorState = { ...this.utilsSrv.getItemsClientBox(ids) };
        this.store.update({ startSelectorState });
        const { width, height, left, top } = startSelectorState;
        this.store.update({
          startSelectItemState: new Map<string, ISelectState & ISelectedItemPercentState>(
            this.getSelectedItems().map(item => {
              const itemState: ISelectState = {
                left: item.styleProps.transform.position.x,
                top: item.styleProps.transform.position.y,
                width: item.styleProps.style.width,
                height: item.styleProps.style.height
              };
              const itemPercentState: ISelectedItemPercentState = {
                leftPercent: selected.size === 1 ? 0 : (divide(subtract(itemState.left, left), width) as number),
                topPercent: selected.size === 1 ? 0 : (divide(subtract(itemState.top, top), height) as number),
                widthPercent: selected.size === 1 ? 1 : divide(itemState.width, width),
                heightPercent: selected.size === 1 ? 1 : divide(itemState.height, height)
              };
              return [item.id, { ...itemState, ...itemPercentState }];
            })
          )
        });
      } else {
        this.store.update({ startSelectItemState: null, startSelectorState: null });
      }
    });
  }

  moveSelected([mx, my]: [number, number]) {
    const { scale, items } = this.editorStore.getValue();
    const { startSelectItemState } = this.store.getValue();
    const itemStateMap = {};
    startSelectItemState.forEach(({ left, top }, id) => {
      const item = items[id];
      const [x, y] = [left + mx / scale, top + my / scale];
      itemStateMap[id] = { ...item, styleProps: { ...item.styleProps, transform: { ...item.styleProps.transform, position: { x, y } } } };
    });
    this.editorSrv.updateItemBatch(itemStateMap);
  }
}
