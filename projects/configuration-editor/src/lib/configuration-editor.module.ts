import { NgModule } from '@angular/core';
import { GridComponent } from './components/grid/grid.component';
import { NoZoomAreaComponent } from './components/no-zoom-area/no-zoom-area.component';
import { ConfigurationEditorComponent } from './configuration-editor.component';
import { DragDirective } from './directives/drag.directive';
import { SelectorDirective } from './directives/selector.directive';

const COMPONENTS = [ConfigurationEditorComponent, NoZoomAreaComponent, GridComponent];
const DIRECTIVES = [DragDirective, SelectorDirective];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES],
  imports: [],
  exports: [ConfigurationEditorComponent]
})
export class ConfigurationEditorModule {}
