export interface IEditorState {
  width: number;
  height: number;
  scale: number;
  left: number;
  top: number;
  background: string | null;
  items: { [id: string]: ItemFormData };
}

export interface ItemFormData {
  id?: string;
  name?: string;
  locked?: boolean;
  usePercent?: boolean;
  styleProps?: ItemStyleProps;
  children?: ItemFormData[];
  [key: string]: any;
}

export interface ItemStyleProps {
  transform: ItemTransform;
  style: ItemStyle;
}

export interface ItemStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  borderWidth?: number;
  borderStyle?: 'dashed' | 'solid';
  borderColor?: string;
  width?: number;
  height?: number;
  paddingLeft?: number;
  paddingBottom?: number;
  paddingRight?: number;
  paddingTop?: number;
  zIndex?: number;
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
