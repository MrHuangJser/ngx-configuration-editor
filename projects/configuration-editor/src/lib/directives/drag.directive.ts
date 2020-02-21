import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { keydownEvent$, keyupEvent$, pointermoveEvent$, pointerupEvent$ } from '../utils/event';

@Directive({
  selector: '[ceDrag]'
})
export class DragDirective implements AfterViewInit, OnDestroy {
  @Input('ceDragDisabled') disabled = false;
  @Input('ceDragUseSpace') useSpace = false;
  @Output('ceDragWaitDrag') waitDragEvent = new EventEmitter();
  @Output('ceDragMoving') movementChange = new EventEmitter<[number, number]>();
  @Output('ceDragStart') start = new EventEmitter<PointerEvent>();
  @Output('ceDragEnd') end = new EventEmitter();

  private sub = new Subscription();

  private spaceKey = false;

  constructor(private eleRef: ElementRef<HTMLElement>, private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.sub.add(this.listenKeyEvent());
    this.sub.add(this.listenMoveEvent());
  }

  private listenKeyEvent() {
    return fromEvent<KeyboardEvent>(this.eleRef.nativeElement, 'keydown')
      .pipe(
        filter(e => e.code === 'Space' && !this.disabled),
        switchMap(e => {
          e.stopPropagation();
          e.preventDefault();
          this.waitDragEvent.emit();
          this.ngZone.run(() => {
            this.spaceKey = true;
          });
          if (this.useSpace) {
            this.eleRef.nativeElement.classList.add('wait-drag');
            this.cdr.detectChanges();
          }
          return keyupEvent$.pipe(filter(e => e.code === 'Space'));
        }),
        map(() => {
          this.spaceKey = false;
          this.eleRef.nativeElement.classList.remove('wait-drag');
          if (this.useSpace) {
            this.end.emit();
          }
        })
      )
      .subscribe();
  }

  private listenMoveEvent() {
    const eleRef = this.eleRef.nativeElement;
    const pointerDown = fromEvent<PointerEvent>(eleRef, 'pointerdown');

    return pointerDown
      .pipe(
        filter(e => e.button === 0 && (this.useSpace ? this.spaceKey : !this.spaceKey) && !this.disabled),
        switchMap(startEvent => {
          startEvent.stopPropagation();
          startEvent.preventDefault();
          this.start.emit(startEvent);
          this.eleRef.nativeElement.classList.add('in-drag');
          return pointermoveEvent$.pipe(
            filter(() => (this.useSpace ? this.spaceKey : !this.spaceKey)),
            map(moveEvent => [moveEvent.clientX - startEvent.clientX, moveEvent.clientY - startEvent.clientY]),
            takeUntil(
              pointerupEvent$.pipe(
                filter(e => e.button === 0),
                map(endEvent => {
                  this.eleRef.nativeElement.classList.remove('in-drag');
                  if (!this.useSpace) {
                    this.end.emit();
                  }
                })
              )
            )
          );
        })
      )
      .subscribe(state => this.movementChange.emit(state as any));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
