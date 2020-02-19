import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EditorStoreQuery } from '../../services/editor-query.service';

@Component({
  selector: '[ce-no-zoom-area]',
  templateUrl: './no-zoom-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoZoomAreaComponent implements OnDestroy {
  @HostBinding('style.width.px') width: number;
  @HostBinding('style.height.px') height: number;
  @HostBinding('style.left.px') left: number;
  @HostBinding('style.top.px') top: number;

  private subscription = new Subscription();

  constructor(public cdr: ChangeDetectorRef, private storeQuery: EditorStoreQuery) {
    this.subscription.add(
      this.storeQuery.select(['width', 'scale', 'height', 'left', 'top']).subscribe(({ width, height, scale, left, top }) => {
        this.width = width * scale;
        this.height = height * scale;
        this.left = left;
        this.top = top;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
