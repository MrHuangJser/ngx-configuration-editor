import { Injectable } from '@angular/core';
import { ConfigurationEditorService } from '../configuration-editor.service';
import { EditorStore } from './editor.store';

@Injectable()
export class CoordinatesService {
  constructor(private store: EditorStore, private editorSrv: ConfigurationEditorService) {}

  private getEditorElement(): HTMLElement {
    return document.querySelector(`[editor-id=${this.editorSrv.editorId}]`);
  }

  clientToEditor(x: number, y: number): [number, number] {
    const ele = this.getEditorElement();
    const { left, top } = ele.getBoundingClientRect();
    return [x - left, y - top];
  }

  editorToCanvas(x: number, y: number): [number, number] {
    const { left, top, scale } = this.store.getValue();
    return [(x - left) / scale, (y - top) / scale];
  }

  clientToCanvas(x: number, y: number) {
    return this.editorToCanvas(...this.clientToEditor(x, y));
  }
}
