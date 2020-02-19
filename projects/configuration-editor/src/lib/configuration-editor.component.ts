import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { ConfigurationEditorService } from './configuration-editor.service';
import { ViewConfig } from './interface';
import { CoordinatesService } from './services/coordinates.service';
import { EditorStore } from './services/editor.store';

@Component({
  selector: 'ce-configuration-editor',
  templateUrl: './configuration-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationEditorComponent implements OnInit {
  @Input('ceConfig')
  set viewConfig(value: ViewConfig) {
    this._viewConfig = value;
  }
  get viewConfig(): ViewConfig {
    return this._viewConfig;
  }
  @Output('ceOnInit') initEmitter = new EventEmitter<any>();
  @HostBinding('attr.editor-id') editorId: string;

  private _viewConfig: ViewConfig;
  private dragStartPoints: [number, number] | null = null;

  constructor(
    public cdr: ChangeDetectorRef,
    public editorSrv: ConfigurationEditorService,
    private store: EditorStore,
    private coordinatesSrv: CoordinatesService
  ) {}

  ngOnInit() {
    this.editorId = this.editorSrv.editorId = `editor_${Date.now()}${Math.round(Math.random() * 100000)}`;
    this.cdr.detectChanges();
  }

  setDragStartPoints(ev: PointerEvent | null) {
    if (ev) {
      const { left, top } = this.store.getValue();
      this.dragStartPoints = [left, top];
    } else {
      this.dragStartPoints = null;
    }
  }

  dragMoving([mx, my]) {
    if (this.dragStartPoints) {
      const [x, y] = this.dragStartPoints;
      console.log(x, y);
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
}
