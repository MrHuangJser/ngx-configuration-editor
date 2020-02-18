import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ce-grid',
  templateUrl: './grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridComponent {
  constructor() {}

  getPath(size: number, scale: number) {
    return `M ${size * scale} 0 L 0 0 0 ${size * scale}`;
  }
}
