import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { multiply } from 'mathjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EditorStoreQuery } from '../../services/editor-query.service';

@Component({
  selector: 'ce-no-zoom-area',
  templateUrl: './no-zoom-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoZoomAreaComponent implements OnInit {
  size$: Observable<{ width: number; height: number }>;
  constructor(public cdr: ChangeDetectorRef, public storeQuery: EditorStoreQuery) {}

  ngOnInit() {
    this.size$ = this.storeQuery
      .select(['width', 'height', 'scale'])
      .pipe(map(({ width, height, scale }) => ({ width: multiply(width, scale), height: multiply(height, scale) })));
  }

  getTransform(left: number, top: number) {
    return `translate3d(${left}px,${top}px,0)`;
  }
}
