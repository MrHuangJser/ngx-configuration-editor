import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { applyTransaction } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationEditorService } from './configuration-editor.service';
import { ISelectorMovingState } from './directives/selector.directive';
import { IEditorState, ItemFormData } from './interface';
import { CoordinatesService } from './services/coordinates.service';
import { EditorStoreQuery } from './services/editor-query.service';
import { EditorStore } from './services/editor.store';
import { SelectorQueryService } from './services/selector-query.service';
import { SelectorStore } from './services/selector.store';
import { UtilsService } from './services/utils.service';

@Component({
  selector: 'ce-configuration-editor',
  templateUrl: './configuration-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorStoreQuery, EditorStore, CoordinatesService, SelectorStore, SelectorQueryService, ConfigurationEditorService, UtilsService],
})
export class ConfigurationEditorComponent implements OnInit, OnDestroy {
  @Input('ceConfig')
  set viewConfig(value: Partial<IEditorState>) {
    if (this.editorSrv) {
      this.editorSrv.setStore(value);
    }
    this._viewConfig = value;
  }
  get viewConfig(): Partial<IEditorState> {
    return this._viewConfig;
  }
  @Output('ceOnInit') initEmitter = new EventEmitter<ConfigurationEditorService>();
  @HostBinding('attr.editor-id') get editorId() {
    return this.coordinatesSrv.editorId;
  }
  @ViewChild('content', { static: false, read: ElementRef }) contentEleRef: ElementRef<HTMLDivElement>;
  selectorDisabled = false;
  items$: Observable<ItemFormData[]>;

  private _viewConfig: Partial<IEditorState>;
  private dragStartPoints: [number, number] | null = null;

  constructor(
    public cdr: ChangeDetectorRef,
    public editorSrv: ConfigurationEditorService,
    public selectorQuery: SelectorQueryService,
    public editorQuery: EditorStoreQuery,
    public utilsSrv: UtilsService,
    private store: EditorStore,
    private coordinatesSrv: CoordinatesService
  ) {
    this.items$ = this.editorQuery.items$.pipe(map((items) => Object.values(items)));
  }

  ngOnInit() {
    this.initEmitter.emit(this.editorSrv);
  }

  ngOnDestroy() {
    this.editorSrv.reset();
    this.store.destroy();
  }

  setSelectorDisable(flag: boolean) {
    this.selectorDisabled = flag;
    this.cdr.detectChanges();
  }

  setDragStartPoints(ev: PointerEvent | null) {
    if (ev) {
      const { left, top } = this.store.getValue();
      this.dragStartPoints = [left, top];
    } else {
      this.dragStartPoints = null;
    }
    this.setSelectorDisable(false);
  }

  dragMoving([mx, my]) {
    if (this.dragStartPoints) {
      const [x, y] = this.dragStartPoints;
      this.editorSrv.moveCanvas(x + mx, y + my);
    }
  }

  @HostListener('wheel', ['$event'])
  scale(e: WheelEvent & { wheelDelta: number }) {
    if (e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const wheelDelta = e.wheelDelta / 120 || -e.deltaY / 3;
      this.editorSrv.scaleCanvas(wheelDelta * 0.05, this.coordinatesSrv.clientToEditor(e.clientX, e.clientY));
    }
  }

  @HostListener('pointerdown', ['$event'])
  clearSelectorState(event: PointerEvent) {
    if (event.button === 0) {
      applyTransaction(() => {
        this.editorSrv.clearBorder();
        this.editorSrv.clearSelector();
      });
    }
  }

  showSelector(state: ISelectorMovingState | null) {
    if (state) {
      this.editorSrv.showSelector(
        ...([...this.coordinatesSrv.clientToEditor(...state.startPoints), ...state.moved] as [number, number, number, number])
      );
    } else {
      this.editorSrv.showSelector(0, 0, 0, 0);
    }
  }

  @HostListener('pointerenter', ['true'])
  @HostListener('pointerleave', ['false'])
  autoFocus(flag: boolean) {
    if (flag) {
      this.contentEleRef.nativeElement.focus({ preventScroll: true });
    } else {
      this.contentEleRef.nativeElement.blur();
    }
  }

  @HostListener('contextmenu', ['$event'])
  contextmenu(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    applyTransaction(() => {
      this.editorSrv.clearBorder();
      this.editorSrv.clearSelector();
    });
    this.editorSrv.events$.next({ type: 'context', event, itemIds: null });
  }

  keydown(event: KeyboardEvent) {
    const { scale } = this.editorQuery.getValue();
    switch (event.code) {
      case 'ArrowLeft':
        this.selectorQuery.moveSelected([-5 / scale, 0]);
        break;
      case 'ArrowUp':
        this.selectorQuery.moveSelected([0, -5 / scale]);
        break;
      case 'ArrowRight':
        this.selectorQuery.moveSelected([1 / scale, 0]);
        break;
      case 'ArrowDown':
        this.selectorQuery.moveSelected([0, 1 / scale]);
        break;
    }
  }
}
