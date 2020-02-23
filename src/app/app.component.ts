import { Component } from '@angular/core';
import { IEditorState } from 'projects/configuration-editor/src/lib/services/editor.store';
import { AlignDirection, ConfigurationEditorService } from 'projects/configuration-editor/src/public-api';
import * as config from '../../config.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  public editorSrv: ConfigurationEditorService;
  public viewConfig: IEditorState;

  constructor() {
    this.viewConfig = {
      ...config.editorTransform.style,
      left: config.editorTransform.transform.x,
      top: config.editorTransform.transform.y,
      scale: config.editorTransform.transform.scale,
      items: config.editorData.reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
    };
  }

  editorInit(editorSrv: ConfigurationEditorService) {
    this.editorSrv = editorSrv;
  }

  align(direction: AlignDirection) {
    this.editorSrv.alignItems(direction, [...this.editorSrv.selectorStore.getValue().selected]);
  }

  group() {
    this.editorSrv.groupItems([...this.editorSrv.selectorStore.getValue().selected]);
  }

  breakUp() {
    this.editorSrv.breakUpItem([...this.editorSrv.selectorStore.getValue().selected][0]);
  }
}
