import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { applyTransaction } from '@datorama/akita';
import { divide, subtract } from 'mathjs';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationEditorService } from '../../configuration-editor.service';
import { ItemFormData } from '../../interface';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { SelectorQueryService } from '../../services/selector-query.service';
import { SelectorStore } from '../../services/selector.store';
import { UtilsService } from '../../services/utils.service';

export type BaseDirection = 'n' | 's' | 'w' | 'e';

export interface ISelectState {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ISelectedItemPercentState {
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}

@Component({
  selector: 'ce-resize-handle',
  templateUrl: './resize-handle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeHandleComponent implements OnInit {
  select$: BehaviorSubject<ISelectState | null> = new BehaviorSubject<ISelectState | null>(null);
  showResizeHandle = true;

  private startSelectItemState: Map<string, ISelectState & ISelectedItemPercentState> | null = null;
  private startSelectorState: ISelectState | null = null;
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
      const { selected } = this.selectorStore.getValue();
      const ids = [...selected];
      this.startSelectorState = { ...this.utilsSrv.getItemsClientBox(ids) };
      const { width, height, left, top } = this.startSelectorState;
      this.startSelectItemState = new Map<string, ISelectState & ISelectedItemPercentState>(
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
      );
    } else {
      this.startSelectItemState = null;
      this.startSelectorState = null;
    }
  }

  moveSelected([mx, my]: [number, number]) {
    const { scale, items } = this.editorStore.getValue();
    const itemStateMap = new Map<string, ItemFormData>();
    this.startSelectItemState.forEach(({ left, top }, id) => {
      const item = items[id];
      const [x, y] = [left + mx / scale, top + my / scale];
      itemStateMap.set(id, { ...item, styleProps: { ...item.styleProps, transform: { ...item.styleProps.transform, position: { x, y } } } });
    });
    this.editorSrv.updateItemBatch(itemStateMap);
  }

  multipleDirectionResize(directions: BaseDirection[], [mx, my]: [number, number]) {
    applyTransaction(() => {
      const { scale } = this.editorStore.getValue();
      directions.forEach(direction => {
        this.editorSrv.updateItemBatch(
          this.utilsSrv.baseDirectionResize(direction, [mx / scale, my / scale], this.startSelectorState, this.startSelectItemState)
        );
      });
    });
  }
}
