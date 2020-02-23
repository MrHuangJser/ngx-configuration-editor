import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ConfigurationEditorService } from '../../configuration-editor.service';
import { ItemFormData } from '../../interface';
import { SelectorQueryService } from '../../services/selector-query.service';
import { SelectorStore } from '../../services/selector.store';
import { UtilsService } from '../../services/utils.service';

const NO_UNIT_PROPERTY = ['zIndex'];
const EXCLUDE_PROPERTY = ['width', 'height'];

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

  private _itemData: ItemFormData;
  constructor(
    private editorSrv: ConfigurationEditorService,
    public selectorQuery: SelectorQueryService,
    public selectorStore: SelectorStore,
    public utilsSrv: UtilsService
  ) {}

  ngOnInit() {
    this.itemTpl = this.editorSrv.getItemViewTpl();
  }

  private setStyles() {
    if (this._itemData) {
      const { style } = this._itemData.styleProps;
      this.styles = {
        ...Object.keys(style)
          .filter(styleName => !EXCLUDE_PROPERTY.includes(styleName))
          .reduce((obj, name) => ({ ...obj, [this.convertCSSPropertyName(name)]: this.convertStyleValue(name, style[name]) }), {}),
        transform: `rotate(${this._itemData.styleProps.transform.rotate}deg)`
      };
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

  @HostListener('pointerenter', ['true'])
  @HostListener('pointerleave', ['false'])
  showBorder(flag: boolean) {
    this.editorSrv.toggleBorder(this._itemData.id, flag);
  }

  @HostListener('contextmenu', ['$event'])
  contextmenu(event: MouseEvent) {
    this.editorSrv.events$.next({ type: 'context', event, itemIds: [...this.selectorStore.getValue().selected] });
  }

  setDragStart(event: PointerEvent | null) {
    if (!event) {
      this.selectorQuery.setResizeHandleVisible(true);
    } else {
      this.selectorQuery.setResizeHandleVisible(false);
    }
    if (event && event.button === 0) {
      const { selected } = this.selectorQuery.getValue();
      if (!event.metaKey && (selected.size <= 1 || !selected.has(this._itemData.id))) {
        this.editorSrv.clearBorder();
        this.editorSrv.clearSelector();
      }
      this.editorSrv.toggleSelector(this._itemData.id, true);
      this.editorSrv.toggleBorder(this._itemData.id, true);
    }
    this.selectorQuery.setStartSelectState(event);
  }
}
