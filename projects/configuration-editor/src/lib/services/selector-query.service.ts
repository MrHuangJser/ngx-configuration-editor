import { Injectable } from '@angular/core';
import { applyTransaction, Query } from '@datorama/akita';
import { divide } from 'mathjs';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfigurationEditorService } from '../configuration-editor.service';
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
}
