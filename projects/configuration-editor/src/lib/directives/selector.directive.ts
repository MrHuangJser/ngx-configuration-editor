import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { pointermoveEvent$, pointerupEvent$ } from '../utils/event';

export interface ISelectorMovingState {
  startPoints: [number, number];
  moved: [number, number];
}

@Directive({
  selector: '[ceSelector]'
})
export class SelectorDirective implements OnInit, OnDestroy {
  @Input('ceSelectorDisabled') disabled = false;
  @Output('ceSelectorStart') start = new EventEmitter<PointerEvent>();
  @Output('ceSelectorMoving') moving = new EventEmitter<ISelectorMovingState>();
  @Output('ceSelectorEnd') end = new EventEmitter<PointerEvent>();

  private subscription = new Subscription();

  constructor(private eleRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.subscription.add(
      fromEvent<PointerEvent>(this.eleRef.nativeElement, 'pointerdown')
        .pipe(
          filter(event => !this.disabled && event.button === 0),
          switchMap(startEv => {
            this.start.emit(startEv);
            return pointermoveEvent$.pipe(
              map(moveEv => {
                const mx = moveEv.clientX - startEv.clientX;
                const my = moveEv.clientY - startEv.clientY;
                return [
                  [mx >= 0 ? startEv.clientX : startEv.clientX + mx, my >= 0 ? startEv.clientY : startEv.clientY + my],
                  [Math.abs(mx), Math.abs(my)]
                ];
              }),
              takeUntil(
                pointerupEvent$.pipe(
                  filter(e => e.button === 0),
                  map(e => this.end.emit(e))
                )
              )
            );
          })
        )
        .subscribe(([startPoints, moved]) => this.moving.emit({ startPoints: startPoints as [number, number], moved: moved as [number, number] }))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
