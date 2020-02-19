import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { keydownEvent$, keyupEvent$, pointermoveEvent$, pointerupEvent$ } from '../utils/event';

@Directive({
  selector: '[ceDrag]'
})
export class DragDirective implements AfterViewInit, OnDestroy {
  @Input() useSpace = false;
  @Output('ceDragMoving') movementChange = new EventEmitter<[number, number]>();
  @Output('ceDragStart') start = new EventEmitter<PointerEvent>();
  @Output('ceDragEnd') end = new EventEmitter<PointerEvent>();
  @HostBinding('class.wait-drag') waitDrag = false;
  @HostBinding('class.in-drag') inDrag = false;

  private sub = new Subscription();

  private spaceKey = false;
  private pointerStart: [number, number] | null = null;

  constructor(private eleRef: ElementRef<HTMLElement>, private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.sub.add(this.listenKeyEvent());
    this.sub.add(this.listenMoveEvent());
  }

  private listenKeyEvent() {
    return this.ngZone.runOutsideAngular(() =>
      keydownEvent$
        .pipe(
          filter(e => e.code === 'Space'),
          switchMap(() => {
            this.ngZone.run(() => {
              this.spaceKey = true;
            });
            if (this.useSpace) {
              this.waitDrag = true;
              this.cdr.detectChanges();
            }
            return keyupEvent$.pipe(filter(e => e.code === 'Space'));
          })
        )
        .subscribe(() => {
          this.ngZone.run(() => {
            this.spaceKey = false;
            this.waitDrag = false;
            this.cdr.detectChanges();
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
            return this.ngZone.runOutsideAngular(() =>
              pointermoveEvent$.pipe(
                filter(() => (this.useSpace ? this.spaceKey : !this.spaceKey)),
                takeUntil(
                  pointerupEvent$.pipe(
                    filter(e => e.button === 0),
                    map(endEvent => this.up(endEvent))
                  )
                )
              )
            );
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
      this.inDrag = true;
      this.cdr.detectChanges();
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
      this.inDrag = false;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
