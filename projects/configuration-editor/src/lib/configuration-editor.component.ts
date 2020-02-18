import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { ViewConfig } from './interface';

@Component({
  selector: 'ce-configuration-editor',
  templateUrl: './configuration-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationEditorComponent {
  @Input('ceConfig')
  set viewConfig(value: ViewConfig) {
    this._viewConfig = value;
  }
  get viewConfig(): ViewConfig {
    return this._viewConfig;
  }
  @Output('ceOnInit') initEmitter = new EventEmitter<any>();

  private _viewConfig: ViewConfig;

  constructor(public cdr: ChangeDetectorRef) {}
}
