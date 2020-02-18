import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding } from '@angular/core';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: '[ce-no-zoom-area]',
  templateUrl: './no-zoom-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoZoomAreaComponent {
  @HostBinding('style.width.px') width: Observable<number>;
  @HostBinding('style.height.px') height: Observable<number>;

  constructor(public cdr: ChangeDetectorRef, private storeQuery: EditorStoreQuery) {
    this.width = this.storeQuery.select(['width', 'scale']).pipe(map(state => state.scale * state.width));
    this.height = this.storeQuery.select(['height', 'scale']).pipe(map(state => state.scale * state.height));
  }
}
