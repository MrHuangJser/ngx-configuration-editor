import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { SelectorQueryService } from '../../services/selector-query.service';
import { SelectorStore } from '../../services/selector.store';

interface ISelectState {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: 'ce-resize-handle',
  templateUrl: './resize-handle.component.html'
})
export class ResizeHandleComponent implements OnInit {
  public select$: Observable<ISelectState>;

  constructor(
    public selectorQuery: SelectorQueryService,
    public selectorStore: SelectorStore,
    public editorQuery: EditorStoreQuery,
    public editorStore: EditorStoreQuery
  ) {}

  ngOnInit() {}

  private calculateSelector() {}
}
