import { fromEvent } from 'rxjs';

export const pointermoveEvent$ = fromEvent<PointerEvent>(document, 'pointermove');
export const pointerupEvent$ = fromEvent<PointerEvent>(document, 'pointerup');
export const keydownEvent$ = fromEvent<KeyboardEvent>(document, 'keydown');
export const keyupEvent$ = fromEvent<KeyboardEvent>(document, 'keyup');
