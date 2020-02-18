import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[ceCrag]'
})
export class DragDirective implements AfterViewInit, OnDestroy {
  @Input() useSpace = false;
  @Output() movementChange = new EventEmitter<[number, number]>();
  @Output('dragStart') start = new EventEmitter<PointerEvent>();
  @Output('dragEnd') end = new EventEmitter<PointerEvent>();

  private sub: Subscription[] = [];
  private moveEvent = fromEvent<PointerEvent>(window, 'pointermove');
  private upEvent = fromEvent<PointerEvent>(window, 'pointerup').pipe(filter(e => e.button === 0));
  private keyDownEvent = fromEvent<KeyboardEvent>(window, 'keydown').pipe(filter(e => e.code === 'Space'));
  private keyUpEvent = fromEvent<KeyboardEvent>(window, 'keyup').pipe(filter(e => e.code === 'Space'));

  private spaceKey = false;
  private pointerStart: [number, number] | null = null;

  constructor(private eleRef: ElementRef<HTMLElement>, private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.sub.push(this.listenKeyEvent());
    this.sub.push(this.listenMoveEvent());
  }

  private listenKeyEvent() {
    return this.ngZone.runOutsideAngular(() =>
      this.keyDownEvent
        .pipe(
          switchMap(() => {
            this.ngZone.run(() => {
              this.spaceKey = true;
            });
            if (this.useSpace) {
              this.eleRef.nativeElement.classList.add('wait-drag');
            }
            return this.keyUpEvent;
          })
        )
        .subscribe(() => {
          this.ngZone.run(() => {
            this.spaceKey = false;
            this.eleRef.nativeElement.classList.remove('wait-drag');
          });
        })
    );
  }

  private listenMoveEvent() {
    const eleRef = this.eleRef.nativeElement;
    const pointerDown = fromEvent<PointerEvent>(eleRef, 'pointerdown');

    return this.ngZone.runOutsideAngular(() =>
      pointerDown
        .pipe(
          filter(e => e.button === 0),
          filter(() => (this.useSpace ? this.spaceKey : !this.spaceKey)),
          switchMap(startEvent => {
            this.down(startEvent);
            return this.ngZone.runOutsideAngular(() => this.moveEvent.pipe(takeUntil(this.upEvent.pipe(map(endEvent => this.up(endEvent))))));
          })
        )
        .subscribe(moveEvent => this.move(moveEvent))
    );
  }

  private down(e: PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.start.emit(e);
    this.pointerStart = [e.clientX, e.clientY];
    this.ngZone.run(() => {
      this.eleRef.nativeElement.classList.add('in-drag');
    });
  }

  private move(e: PointerEvent) {
    if (this.pointerStart) {
      this.movementChange.emit([e.clientX - this.pointerStart[0], e.clientY - this.pointerStart[1]]);
    }
  }

  private up(e: PointerEvent) {
    this.end.emit(e);
    this.pointerStart = null;
    this.ngZone.run(() => {
      this.eleRef.nativeElement.classList.remove('in-drag');
    });
  }

  ngOnDestroy() {
    this.sub.forEach(i => i.unsubscribe());
    this.sub = [];
  }
}
