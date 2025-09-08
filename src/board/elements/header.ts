import type { Box, Point, resizeDirection, ShapeProps } from "../types";
import ShapeObject from "./element";

class Header extends ShapeObject {
   constructor(props?: ShapeProps) {
      super(props || {})
      this.element = document.createElement("div");
      this.element.style.position = "absolute";
      this.element.style.left = `${this.left}px`;
      this.element.style.top = `${this.top}px`;
      this.element.style.width = `${this.width}px`;
      this.element.style.height = `${this.height}px`
      this.element.style.border = `1px solid ${this.stroke}`;
   }

   IsResizable(p: Point): resizeDirection | null {
      return super.IsResizable(p)
   }

   Resizing(current: Point, old: Box, d: resizeDirection): void {
      super.Resizing(current, old, d);
   }

   IsDraggable(p: Point): boolean {
      return (p.x > this.left && p.x < this.left + this.width && p.y > this.top && p.y < this.top + this.height);
   }

   Dragging(prev: Point, current: Point): void {
      super.Dragging(prev, current);
   }
}

export default Header;