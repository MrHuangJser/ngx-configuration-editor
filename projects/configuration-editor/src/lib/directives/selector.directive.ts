import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { map, switchMap, takeUntil, filter } from 'rxjs/operators';
import { pointermoveEvent$, pointerupEvent$ } from '../utils/event';

export interface ISelectorMovingState {
  startPoints: [number, number];
  moved: [number, number];
}

@Directive({
  selector: '[ceSelector]'
})
export class SelectorDirective implements OnInit, OnDestroy {
  @Output('ceSelectorMoving') moving = new EventEmitter<ISelectorMovingState>();
  @Output('ceSelectorEnd') end = new EventEmitter<void>();

  private subscription = new Subscription();

  constructor(private eleRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.subscription.add(
      fromEvent<PointerEvent>(this.eleRef.nativeElement, 'pointerdown')
        .pipe(
          switchMap(startEv =>
            pointermoveEvent$.pipe(
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
                  map(() => this.end.emit())
                )
              )
            )
          )
        )
        .subscribe(([startPoints, moved]) => this.moving.emit({ startPoints: startPoints as [number, number], moved: moved as [number, number] }))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
