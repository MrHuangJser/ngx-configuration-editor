import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BorderAreaComponent } from './components/border-area/border-area.component';
import { GridComponent } from './components/grid/grid.component';
import { NoZoomAreaComponent } from './components/no-zoom-area/no-zoom-area.component';
import { ResizeHandleComponent } from './components/resize-handle/resize-handle.component';
import { ZoomAreaComponent } from './components/zoom-area/zoom-area.component';
import { ConfigurationEditorComponent } from './configuration-editor.component';
import { DragDirective } from './directives/drag.directive';
import { SelectorDirective } from './directives/selector.directive';

const COMPONENTS = [ConfigurationEditorComponent, NoZoomAreaComponent, GridComponent, BorderAreaComponent, ResizeHandleComponent, ZoomAreaComponent];
const DIRECTIVES = [DragDirective, SelectorDirective];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES],
  imports: [CommonModule],
  exports: [ConfigurationEditorComponent, DragDirective]
})
export class ConfigurationEditorModule {}
