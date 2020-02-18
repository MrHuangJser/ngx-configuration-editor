import { fromEvent } from 'rxjs';

export const pointermoveEvent$ = fromEvent<PointerEvent>(document, 'pointermove');
export const pointerupEvent$ = fromEvent<PointerEvent>(document, 'pointerup');
