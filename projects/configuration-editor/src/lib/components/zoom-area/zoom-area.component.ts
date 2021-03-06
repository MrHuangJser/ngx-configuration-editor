import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EditorStoreQuery } from '../../services/editor-query.service';
import { EditorStore } from '../../services/editor.store';

@Component({
  selector: 'ce-zoom-area',
  templateUrl: './zoom-area.component.html'
})
export class ZoomAreaComponent implements OnInit {
  constructor(public editorStore: EditorStore, public editorQuery: EditorStoreQuery, public ds: DomSanitizer) {}

  ngOnInit() {}
}
