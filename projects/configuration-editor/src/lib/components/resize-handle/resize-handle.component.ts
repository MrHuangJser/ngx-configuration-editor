import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { applyTransaction } from '@datorama/akita';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
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
export class ResizeHandleComponent implements OnInit {
  select$: BehaviorSubject<ISelectState | null> = new BehaviorSubject<ISelectState | null>(null);
  showResizeHandle = true;

  private subscription = new Subscription();
  constructor(
    public selectorQuery: SelectorQueryService,
    public selectorStore: SelectorStore,
    public editorQuery: EditorStoreQuery,
    public editorStore: EditorStoreQuery,
    private editorSrv: ConfigurationEditorService,
    private utilsSrv: UtilsService
  ) {}

  ngOnInit() {
    this.subscription.add(
      merge(this.selectorQuery.selected$, this.editorQuery.items$)
        .pipe(map(() => this.calculateSelector()))
        .subscribe(state => this.select$.next(state))
    );
  }

  private calculateSelector(): ISelectState {
    return this.utilsSrv.getItemClientBoxByPercent([...this.selectorStore.getValue().selected]);
  }

  multipleDirectionResize(directions: BaseDirection[], [mx, my]: [number, number]) {
    applyTransaction(() => {
      const { scale } = this.editorStore.getValue();
      const { startSelectItemState, startSelectorState } = this.selectorStore.getValue();
      directions.forEach(direction => {
        this.editorSrv.updateItemBatch(
          this.utilsSrv.baseDirectionResize(direction, [mx / scale, my / scale], startSelectorState, startSelectItemState)
        );
      });
    });
  }
}
