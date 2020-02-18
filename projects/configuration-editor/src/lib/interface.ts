export interface ViewConfig {
  editorTransform: ContainerProps;
  editorData: ItemFormData[];
}

export interface ContainerProps {
  transform: {
    x: number;
    y: number;
    scale?: number;
  };
  style?: {
    width?: number;
    height?: number;
    background?: string;
  };
}

export interface ItemFormData {
  id?: string;
  name?: string;
  locked?: boolean;
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
