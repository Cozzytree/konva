import type { Box, Point, resizeDirection, ShapeProps } from "../types";
import { resizeRect } from "../utils/reactResize";

class ShapeObject implements ShapeProps {
   declare element: HTMLElement;
   id: string;
   height: number;
   left: number;
   top: number;
   width: number;
   stroke: string;
   fill: string;

   constructor(props: ShapeProps) {
      this.id = "";
      this.height = props.height || 100;
      this.width = props.width || 100;
      this.left = props.left || 0;
      this.top = props.top || 0;
      this.stroke = props.stroke || "#202020";
      this.fill = props.fill || "transparent"
   }

   private pointerdown(e: PointerEvent | MouseEvent) {
   }

   private pointermove(e: PointerEvent | MouseEvent) {

   }

   private pointerup(e: PointerEvent | MouseEvent) {
   }

   Element() {
      return this.element;
   }

   ID(): string {
      return this.id;
   }

   mousemove() { }

   Dragging(prev: Point, current: Point): void {
      const dx = current.x - prev.x;
      const dy = current.y - prev.y

      this.left += dx;
      this.top += dy;
      this.element.style.left = `${this.left}px`;
      this.element.style.top = `${this.top}px`;
   }

   IsDraggable(_: Point): boolean {
      return false;
   }

   IsResizable(p: Point): resizeDirection | null {
      const d = resizeRect(
         p,
         { x1: this.left, x2: this.left + this.width, y1: this.top, y2: this.top + this.height },
         20
      )
      if (!d) {
         return null;
      }

      return d.rd;
   }

   Resizing(current: Point, old: Box, d: resizeDirection): void {
      switch (d) {
         case "tl":
            if (current.x > old.x2) {
               this.left = old.x2;
               this.width = current.x - old.x2;
            } else {
               this.left = current.x;
               this.width = old.x2 - current.x;
            }

            if (current.y > old.y2) {
               this.top = old.y2;
               this.height = current.y - old.y2;
            } else {
               this.top = current.y;
               this.height = old.y2 - current.y;
            }
            break;
         case "tr":
            if (current.x < old.x1) {
               this.left = current.x;
               this.width = old.x1 - current.x;
            } else {
               this.left = old.x1;
               this.width = current.x - old.x1;
            }

            if (current.y > old.y2) {
               this.top = old.y2;
               this.height = current.y - old.y2;
            } else {
               this.top = current.y;
               this.height = old.y2 - current.y;
            }
            break;
         case "br":
            if (current.x < old.x1) {
               this.left = current.x;
               this.width = old.x1 - current.x;
            } else {
               this.left = old.x1;
               this.width = current.x - old.x1;
            }

            if (current.y > old.y1) {
               this.top = old.y1;
               this.height = current.y - old.y1;
            } else {
               this.top = current.y;
               this.height = old.y1 - current.y;
            }
            break;
         case "bl":
            if (current.x > old.x2) {
               this.left = old.x2;
               this.width = current.x - old.x2;
            } else {
               this.left = current.x;
               this.width = old.x2 - current.x;
            }
            if (current.y > old.y1) {
               this.top = old.y1;
               this.height = current.y - old.y1;
            } else {
               this.top = current.y;
               this.height = old.y1 - current.y;
            }
      }

      this.element.style.left = `${this.left}px`;
      this.element.style.top = `${this.top}px`;
      this.element.style.width = `${this.width}px`;
      this.element.style.height = `${this.height}px`;
   }
}

export default ShapeObject;