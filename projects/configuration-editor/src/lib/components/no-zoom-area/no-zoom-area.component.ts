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
  @HostBinding('style.transform') transform: string;

  private subscription = new Subscription();

  constructor(public cdr: ChangeDetectorRef, private storeQuery: EditorStoreQuery) {
    this.subscription.add(
      this.storeQuery.select(['width', 'scale', 'height', 'left', 'top']).subscribe(({ width, height, scale, left, top }) => {
        this.width = width * scale;
        this.height = height * scale;
        this.transform = `translate3d(${left}px,${top}px,0)`;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
