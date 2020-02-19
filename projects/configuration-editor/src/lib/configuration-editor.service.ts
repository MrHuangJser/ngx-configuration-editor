import { Injectable } from '@angular/core';
import { action } from '@datorama/akita';
import { EditorStore } from './services/editor.store';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationEditorService {
  public editorId: string;
  constructor(private store: EditorStore) {}

  @action('ce-editor:moveCanvas')
  moveCanvas(x: number, y: number) {
    this.store.update({ left: x, top: y });
  }

  @action('ce-editor:scaleCanvas')
  scaleCanvas(delta: number, center: [number, number] | null) {
    const { scale, left, top } = this.store.getValue();
    const [x, y] = center || [left, top];
    const newScale = scale + delta;
    if (newScale <= 4 && newScale >= 0.2) {
      this.store.update({ scale: newScale, left: (left - x) * (delta / scale) + left, top: (top - y) * (delta / scale) + top });
    }
  }
}
