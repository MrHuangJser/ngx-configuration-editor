import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GridComponent } from './components/grid/grid.component';
import { NoZoomAreaComponent } from './components/no-zoom-area/no-zoom-area.component';
import { ConfigurationEditorComponent } from './configuration-editor.component';
import { DragDirective } from './directives/drag.directive';
import { SelectorDirective } from './directives/selector.directive';
import { CoordinatesService } from './services/coordinates.service';
import { EditorStoreQuery } from './services/editor-query.service';
import { EditorStore } from './services/editor.store';
import { SelectorQueryService } from './services/selector-query.service';
import { SelectorStore } from './services/selector.store';

const COMPONENTS = [ConfigurationEditorComponent, NoZoomAreaComponent, GridComponent];
const DIRECTIVES = [DragDirective, SelectorDirective];
const SERVICES = [EditorStoreQuery, EditorStore, CoordinatesService, SelectorStore, SelectorQueryService];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES],
  imports: [CommonModule],
  providers: [...SERVICES],
  exports: [ConfigurationEditorComponent, DragDirective]
})
export class ConfigurationEditorModule {}
