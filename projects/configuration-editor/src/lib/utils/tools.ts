interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function pointIsInRect(point: [number, number], rect: IRect) {
  const { x, y, w, h } = rect;
  const [px, py] = point;
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

export function rectIsContainerRect(child: IRect, parent: IRect) {
  const { x: cx, y: cy, w: cw, h: ch } = child;
  return pointIsInRect([cx, cy], parent) && pointIsInRect([cx + cw, cy + ch], parent);
}
