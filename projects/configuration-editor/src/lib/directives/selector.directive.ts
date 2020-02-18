import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { pointermoveEvent$, pointerupEvent$ } from '../utils/event';

export interface ISelectorState {
  startPoints: number[];
  moved: number[];
}

@Directive({
  selector: '[ceSelector]'
})
export class SelectorDirective implements OnInit, OnDestroy {
  @Output('ceSelectorMoving') moving = new EventEmitter<ISelectorState>();
  @Output('ceSelectorEnd') end = new EventEmitter<void>();

  private subscription = new Subscription();

  constructor(private eleRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.subscription.add(
      fromEvent<PointerEvent>(this.eleRef.nativeElement, 'pointerdown')
        .pipe(
          switchMap(startEv =>
            pointermoveEvent$.pipe(
              map(moveEv => [
                [startEv.clientX, startEv.clientY],
                [moveEv.clientX - startEv.clientX, moveEv.clientY - startEv.clientY]
              ]),
              takeUntil(pointerupEvent$.pipe(map(() => this.end.emit())))
            )
          )
        )
        .subscribe(([startPoints, moved]) => this.moving.emit({ startPoints, moved }))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
