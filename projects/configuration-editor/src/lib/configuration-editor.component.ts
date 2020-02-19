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
import { ConfigurationEditorService } from './configuration-editor.service';
import { ISelectorMovingState } from './directives/selector.directive';
import { CoordinatesService } from './services/coordinates.service';
import { EditorStoreQuery } from './services/editor-query.service';
import { EditorStore, IEditorState } from './services/editor.store';
import { SelectorQueryService } from './services/selector-query.service';

@Component({
  selector: 'ce-configuration-editor',
  templateUrl: './configuration-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  @Output('ceOnInit') initEmitter = new EventEmitter<any>();
  @HostBinding('attr.editor-id') editorId: string;
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
    this.editorId = this.editorSrv.editorId = `editor_${Date.now()}${Math.round(Math.random() * 100000)}`;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.editorSrv.reset();
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
