import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { merge, Subscription } from 'rxjs';
import {} from 'rxjs/observable';
import { ItemFormData } from '../../interface';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { EditorStore } from '../../services/editor.store';
import { SelectorQueryService } from '../../services/selector-query.service';
import { SelectorStore } from '../../services/selector.store';

@Component({
  selector: 'ce-border-area',
  templateUrl: './border-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BorderAreaComponent implements OnInit, OnDestroy {
  borderedList: ItemFormData[];

  private subscription = new Subscription();

  constructor(
    public selectorStore: SelectorStore,
    public selectorQuery: SelectorQueryService,
    public editorQuery: EditorStoreQuery,
    public editorStore: EditorStore
  ) {}

  ngOnInit() {
    this.subscription.add(
      merge(this.editorQuery.items$, this.selectorQuery.bordered$).subscribe(() => {
        const { bordered } = this.selectorStore.getValue();
        const { items } = this.editorStore.getValue();
        this.borderedList = [...bordered].map(id => items[id]);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
