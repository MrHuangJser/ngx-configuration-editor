import { Injectable } from '@angular/core';
import { Query, applyTransaction } from '@datorama/akita';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfigurationEditorService } from '../configuration-editor.service';
import { rectIsContainerRect } from '../utils/tools';
import { CoordinatesService } from './coordinates.service';
import { EditorStore } from './editor.store';
import { ISelectorState, SelectorStore } from './selector.store';

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
    private coordinatesSrv: CoordinatesService
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
              const itemRect = {
                x: item.styleProps.transform.position.x,
                y: item.styleProps.transform.position.y,
                w: item.styleProps.style.width,
                h: item.styleProps.style.height
              };
              const selectorRect = {
                x: selectorX,
                y: selectorY,
                w: selectorWidth / scale,
                h: selectorHeight / scale
              };
              const flag = rectIsContainerRect(itemRect, selectorRect);
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