import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { divide, multiply } from 'mathjs';
import { merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBorderState } from '../../interface';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { EditorStore } from '../../services/editor.store';
import { SelectorQueryService } from '../../services/selector-query.service';
import { SelectorStore } from '../../services/selector.store';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'ce-border-area',
  templateUrl: './border-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BorderAreaComponent implements OnInit, OnDestroy {
  borderState: IBorderState;
  private subscription = new Subscription();

  constructor(
    public selectorQuery: SelectorQueryService,
    private cdr: ChangeDetectorRef,
    private selectorStore: SelectorStore,
    private utilsSrv: UtilsService,
    private editorStore: EditorStore,
    private editorQuery: EditorStoreQuery
  ) {}

  ngOnInit() {
    this.subscription.add(
      merge(this.editorQuery.items$, this.selectorQuery.bordered$)
        .pipe(
          map<any, IBorderState>(() => {
            const { bordered, selected } = this.selectorStore.getValue();
            const { items, width, height } = this.editorStore.getValue();
            return {
              ...[...bordered].reduce<IBorderState>((obj, id) => {
                const item = items[id];
                return {
                  ...obj,
                  [id]: item && {
                    left: multiply(divide(item.styleProps.transform.position.x, width), 100),
                    top: multiply(divide(item.styleProps.transform.position.y, height), 100),
                    width: multiply(divide(item.styleProps.style.width, width), 100),
                    height: multiply(divide(item.styleProps.style.height, height), 100),
                    rotate: item.styleProps.transform.rotate
                  }
                };
              }, {} as IBorderState),
              total: this.utilsSrv.getItemClientBoxByPercent([...selected])
            };
          })
        )
        .subscribe(state => {
          this.borderState = state;
          this.cdr.detectChanges();
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
