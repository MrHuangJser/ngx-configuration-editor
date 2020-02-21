import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ConfigurationEditorService } from '../../configuration-editor.service';
import { ItemFormData } from '../../interface';
import { divide, multiply } from 'mathjs';

const NO_UNIT_PROPERTY = ['zIndex'];

@Component({
  selector: 'ce-item',
  templateUrl: './item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {
  itemTpl: TemplateRef<void>;
  @Input('ceItemData')
  set itemData(value: ItemFormData) {
    this._itemData = value;
    this.setStyles();
  }
  get itemData(): ItemFormData {
    return this._itemData;
  }
  @Input('ceItemParentWidth') parentWidth: number;
  @Input('ceItemParentHeight') parentHeight: number;
  @ViewChild('ceItem', { static: false, read: ElementRef }) itemEle: ElementRef<HTMLDivElement>;
  styles: { [klass: string]: any } = {};
  get left(): number {
    return this._itemData ? multiply(divide(this._itemData.styleProps.transform.position.x, this.parentWidth), 100) : 0;
  }
  get top(): number {
    return this._itemData ? multiply(divide(this._itemData.styleProps.transform.position.y, this.parentHeight), 100) : 0;
  }

  private _itemData: ItemFormData;
  constructor(private editorSrv: ConfigurationEditorService) {}

  ngOnInit() {
    this.itemTpl = this.editorSrv.getItemViewTpl();
  }

  private setStyles() {
    if (this._itemData) {
      const styles: { [key: string]: any } = {};
      for (const styleName in this._itemData.styleProps.style) {
        if (this._itemData.styleProps.style.hasOwnProperty(styleName)) {
          const styleValue = this._itemData.styleProps.style[styleName];
          styles[this.convertCSSPropertyName(styleName)] = this.convertStyleValue(styleName, styleValue);
        }
      }
      styles.transform = `rotate(${this._itemData.styleProps.transform.rotate}deg)`;
      this.styles = styles;
    }
  }

  private convertCSSPropertyName(property: string) {
    return property.replace(/([A-Z])/, $1 => `-${$1.toLowerCase()}`);
  }

  private convertStyleValue(styleName: string, value: string | number) {
    if (typeof value === 'number') {
      if (!NO_UNIT_PROPERTY.includes(styleName)) {
        return `${value}px`;
      }
    }
    return value;
  }
}
