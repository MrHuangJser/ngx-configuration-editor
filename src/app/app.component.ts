import { Component } from '@angular/core';
import { AlignDirection, ConfigurationEditorService, IEditorState } from 'projects/configuration-editor/src/public-api';
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

  update() {
    const { items } = this.editorSrv.editorStore.getValue();
    const { selected } = this.editorSrv.selectorStore.getValue();
    if (selected.size === 1) {
      const item = items[[...selected][0]];
      this.editorSrv.updateItemBatch({
        [item.id]: {
          ...item,
          styleProps: {
            ...item.styleProps,
            style: { ...item.styleProps.style, height: 15 },
            transform: { ...item.styleProps.transform, position: { x: 30, y: 0 } }
          }
        }
      });
    }
  }
}
