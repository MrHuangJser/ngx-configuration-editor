import { Directive, Host, OnInit, TemplateRef } from '@angular/core';
import { ConfigurationEditorService } from '../configuration-editor.service';

@Directive({
  selector: '[ceItemView]'
})
export class ItemViewDirective implements OnInit {
  constructor(private ref: TemplateRef<void>, @Host() private editorSrv: ConfigurationEditorService) {}

  ngOnInit() {
    this.editorSrv.setItemViewTpl(this.ref);
  }
}
