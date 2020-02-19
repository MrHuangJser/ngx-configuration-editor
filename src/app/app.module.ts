import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ConfigurationEditorModule } from 'projects/configuration-editor/src/public-api';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ConfigurationEditorModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
