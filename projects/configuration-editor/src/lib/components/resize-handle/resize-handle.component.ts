import { ChangeDetectionStrategy, Component } from '@angular/core';
import { applyTransaction } from '@datorama/akita';
import { divide, multiply } from 'mathjs';
import { interval, merge, Observable, of } from 'rxjs';
import { delay, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { ConfigurationEditorService } from '../../configuration-editor.service';
import { BaseDirection, ISelectState } from '../../interface';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { SelectorQueryService } from '../../services/selector-query.service';
import { SelectorStore } from '../../services/selector.store';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'ce-resize-handle',
  templateUrl: './resize-handle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeHandleComponent {
  select$: Observable<ISelectState>;
  resizeHandleVisible$: Observable<boolean>;

  constructor(
    public selectorQuery: SelectorQueryService,
    public selectorStore: SelectorStore,
    public editorQuery: EditorStoreQuery,
    public editorStore: EditorStoreQuery,
    private editorSrv: ConfigurationEditorService,
    private utilsSrv: UtilsService
  ) {
    this.resizeHandleVisible$ = merge(this.selectorQuery.showResizeHandle$, this.selectorQuery.selected$).pipe(
      map(() => this.selectorStore.getValue().showResizeHandle)
    );
    this.select$ = merge(this.selectorQuery.selected$, this.editorQuery.items$).pipe(
      map(() => this.calculateSelector()),
      switchMap(state => {
        const { selected } = this.selectorStore.getValue();
        if (!state && selected.size) {
          const intervalCalculate$ = interval(100).pipe(
            filter(i => !!i),
            map(() => this.calculateSelector()),
            filter(s => !!s)
          );
          return intervalCalculate$.pipe(takeUntil(intervalCalculate$.pipe(delay(100))));
        }
        return of(state);
      })
    );
  }

  private calculateSelector(): ISelectState {
    return this.utilsSrv.getItemClientBoxByPercent([...this.selectorStore.getValue().selected]);
  }

  multipleDirectionResize(directions: BaseDirection[], [mx, my]: [number, number]) {
    applyTransaction(() => {
      const { scale, width, height } = this.editorStore.getValue();
      const { startSelectItemState, startSelectorState } = this.selectorStore.getValue();
      directions.forEach(direction => {
        this.editorSrv.updateItemBatch(
          this.utilsSrv.baseDirectionResize(
            direction,
            [multiply(divide(divide(mx, scale), width), 100), multiply(divide(divide(my, scale), height), 100)],
            startSelectorState,
            startSelectItemState
          )
        );
      });
    });
  }
}
