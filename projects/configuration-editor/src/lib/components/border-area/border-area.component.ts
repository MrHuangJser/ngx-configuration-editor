import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { EditorStore } from '../../services/editor.store';
import { SelectorQueryService } from '../../services/selector-query.service';
import { SelectorStore } from '../../services/selector.store';
import { UtilsService } from '../../services/utils.service';
import { ISelectState } from '../resize-handle/resize-handle.component';

type BorderStateType = ISelectState & { rotate?: number };

interface IBorderState {
  total: BorderStateType;
  [id: string]: BorderStateType;
}

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
            const { bordered } = this.selectorStore.getValue();
            const { items, width, height } = this.editorStore.getValue();
            return {
              ...[...bordered].reduce<IBorderState>((obj, id) => {
                const item = items[id];
                return {
                  ...obj,
                  [id]: {
                    left: (item.styleProps.transform.position.x / width) * 100,
                    top: (item.styleProps.transform.position.y / height) * 100,
                    width: (item.styleProps.style.width / width) * 100,
                    height: (item.styleProps.style.height / height) * 100
                  }
                };
              }, {} as IBorderState),
              total: this.utilsSrv.getItemClientBoxByPercent([...this.selectorStore.getValue().bordered])
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
