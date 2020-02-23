import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BorderAreaComponent } from './components/border-area/border-area.component';
import { GridComponent } from './components/grid/grid.component';
import { ItemComponent } from './components/item/item.component';
import { NoZoomAreaComponent } from './components/no-zoom-area/no-zoom-area.component';
import { ResizeHandleComponent } from './components/resize-handle/resize-handle.component';
import { ZoomAreaComponent } from './components/zoom-area/zoom-area.component';
import { ConfigurationEditorComponent } from './configuration-editor.component';
import { DragDirective } from './directives/drag.directive';
import { ItemViewDirective } from './directives/item-view.directive';
import { SelectorDirective } from './directives/selector.directive';
import { MenuComponent } from './components/menu/menu.component';

const COMPONENTS = [
  ConfigurationEditorComponent,
  NoZoomAreaComponent,
  GridComponent,
  BorderAreaComponent,
  ResizeHandleComponent,
  ZoomAreaComponent,
  ItemComponent
];
const DIRECTIVES = [DragDirective, SelectorDirective, ItemViewDirective];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES, MenuComponent],
  imports: [CommonModule],
  exports: [ConfigurationEditorComponent, ItemViewDirective]
})
export class ConfigurationEditorModule {}
