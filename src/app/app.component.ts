import { Component } from '@angular/core';
import { ConfigurationEditorService } from 'projects/configuration-editor/src/public-api';
import * as config from '../../config.json';
import { IEditorState } from 'projects/configuration-editor/src/lib/services/editor.store';

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
}
