import { ChangeDetectorRef, Component, ChangeDetectionStrategy } from '@angular/core';
import { EditorStoreQuery } from '../../services/editor-query.service';

@Component({
  selector: 'ce-no-zoom-area',
  templateUrl: './no-zoom-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoZoomAreaComponent {
  constructor(public cdr: ChangeDetectorRef, public storeQuery: EditorStoreQuery) {}

  getTransform(left: number, top: number) {
    return `translate3d(${left}px,${top}px,0)`;
  }
}
