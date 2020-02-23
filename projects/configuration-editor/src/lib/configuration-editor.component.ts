import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { applyTransaction } from '@datorama/akita';
import { ConfigurationEditorService } from './configuration-editor.service';
import { ISelectorMovingState } from './directives/selector.directive';
import { CoordinatesService } from './services/coordinates.service';
import { EditorStoreQuery } from './services/editor-query.service';
import { EditorStore, IEditorState } from './services/editor.store';
import { SelectorQueryService } from './services/selector-query.service';
import { SelectorStore } from './services/selector.store';
import { UtilsService } from './services/utils.service';

@Component({
  selector: 'ce-configuration-editor',
  templateUrl: './configuration-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorStoreQuery, EditorStore, CoordinatesService, SelectorStore, SelectorQueryService, ConfigurationEditorService, UtilsService]
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
  selectorDisabled = false;

  private _viewConfig: Partial<IEditorState>;
  private dragStartPoints: [number, number] | null = null;

  constructor(
    public cdr: ChangeDetectorRef,
    public editorSrv: ConfigurationEditorService,
    public selectorQuery: SelectorQueryService,
    public editorQuery: EditorStoreQuery,
    private store: EditorStore,
    private coordinatesSrv: CoordinatesService
  ) {}

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

  @HostListener('pointerdown')
  clearSelectorState() {
    applyTransaction(() => {
      this.editorSrv.clearBorder();
      this.editorSrv.clearSelector();
    });
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
}
