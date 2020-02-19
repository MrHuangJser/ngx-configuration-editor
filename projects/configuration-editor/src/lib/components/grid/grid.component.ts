import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EditorStoreQuery } from '../../services/editor-query.service';

@Component({
  selector: 'ce-grid',
  templateUrl: './grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridComponent {
  constructor(public storeQuery: EditorStoreQuery) {}

  getPath(size: number, scale: number) {
    return `M ${size * scale || 0} 0 L 0 0 0 ${size * scale || 0}`;
  }
}
