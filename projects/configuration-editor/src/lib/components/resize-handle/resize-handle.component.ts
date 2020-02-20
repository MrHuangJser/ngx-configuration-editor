import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationEditorService } from '../../configuration-editor.service';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { SelectorQueryService } from '../../services/selector-query.service';
import { SelectorStore } from '../../services/selector.store';
import { UtilsService } from '../../services/utils.service';

export interface ISelectState {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: 'ce-resize-handle',
  templateUrl: './resize-handle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeHandleComponent implements OnInit {
  select$: BehaviorSubject<ISelectState | null> = new BehaviorSubject<ISelectState | null>(null);
  showResizeHandle = true;

  private startSelectItemState: Map<string, ISelectState> | null = null;
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

  private getSelectedItems() {
    const { items } = this.editorStore.getValue();
    const { selected } = this.selectorStore.getValue();
    return [...selected].map(id => items[id]);
  }

  private calculateSelector(): ISelectState {
    return this.utilsSrv.getItemClientBoxByPercent([...this.selectorStore.getValue().selected]);
  }

  setStartSelectState(event: PointerEvent | null) {
    if (event) {
      this.showResizeHandle = false;
      this.startSelectItemState = new Map<string, ISelectState>(
        this.getSelectedItems().map(item => [
          item.id,
          {
            left: item.styleProps.transform.position.x,
            top: item.styleProps.transform.position.y,
            width: item.styleProps.style.width,
            height: item.styleProps.style.height
          }
        ])
      );
    } else {
      this.startSelectItemState = null;
      this.showResizeHandle = true;
    }
  }

  moveSelected([mx, my]: [number, number]) {
    const { scale } = this.editorStore.getValue();
    const itemMoveMap = new Map<string, [number, number]>();
    this.startSelectItemState.forEach(({ left, top }, id) => {
      itemMoveMap.set(id, [left + mx / scale, top + my / scale]);
    });
    this.editorSrv.moveItemBatch(itemMoveMap);
  }
}
