export interface ItemFormData {
  id?: string;
  name?: string;
  locked?: boolean;
  usePercent?: boolean;
  data?: any;
  widget?: ItemWidget;
  styleProps?: ItemStyleProps;
  children?: ItemFormData[];
  events?: ItemEvent[];
}

export interface ItemWidget {
  type: string;
  props?: any;
}

export interface ItemStyleProps {
  transform: ItemTransform;
  style: ItemStyle;
}

export interface ItemStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  borderWidth?: number;
  borderType?: 'dashed' | 'solid';
  borderColor?: string;
  width?: number;
  height?: number;
  paddingLeft?: number;
  paddingBottom?: number;
  paddingRight?: number;
  paddingTop?: number;
  zIndex?: number;
}

export interface ItemEvent {
  id: string;
  trigger: {
    type: 'EVENT' | 'DATA';
    name?: EventType;
    condition?: ConditionType;
    point?: any;
    pointId?: string;
    pointValue?: any;
  };
  action: {
    type: ActionType;
    params: any;
  };
}

export interface IPosition {
  x: number;
  y: number;
}

export interface ItemTransform {
  position: IPosition;
  scale: number;
  rotate: number;
}

export enum ActionType {
  PAGE_JUMP = 'PAGE_JUMP',
  CHANGE_ATTRIBUTE = 'CHANGE_ATTRIBUTE',
  SHOW_POPOVER = 'SHOW_POPOVER'
}

export enum ConditionType {
  EQUAL = 'EQUAL',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_AND_EQUAL = 'LESS_AND_EQUAL',
  GREATER_AND_EQUAL = 'GREATER_AND_EQUAL',
  UNEQUAL = 'UNEQUAL'
}
export enum EventType {
  CLICK = 'CLICK',
  MOUSE_ENTER = 'MOUSE_ENTER',
  MOUSE_LEAVE = 'MOUSE_LEAVE',
  DOUBLE_CLICK = 'DOUBLE_CLICK'
}

export type BaseDirection = 'n' | 's' | 'w' | 'e';

export interface ISelectState {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ISelectedItemPercentState {
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export type BorderStateType = ISelectState & { rotate?: number };

export interface IBorderState {
  total: BorderStateType | null;
  [id: string]: BorderStateType | null;
}

export type AlignDirection = 'left' | 'top' | 'right' | 'bottom' | 'horizontal' | 'vertical' | 'distribute-horizontal' | 'distribute-vertical';

export interface IEditorKeyEvent {
  type: 'keydown';
  event: KeyboardEvent;
}

export interface IEditorContextEvent {
  type: 'context';
  event: MouseEvent;
  itemIds: string[] | null;
}

export type EditorEventsType = IEditorKeyEvent | IEditorContextEvent;
