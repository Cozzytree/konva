import type { Box, Point, resizeDirection, ShapeProps } from "../types";
import ShapeObject, { type drawProps } from "./element";

class Header extends ShapeObject {
   constructor(props: ShapeProps) {
      super(props || {})
      this.element = document.createElement("div");
      this.element.style.position = "absolute";
      this.element.style.left = `${this.left}px`;
      this.element.style.top = `${this.top}px`;
      this.element.style.width = `${this.width}px`;
      this.element.style.height = `${this.height}px`
      this.element.style.border = `1px solid ${this.stroke}`;
      this.element.classList.add("element");
   }

   draw(props: drawProps): HTMLElement {
      if (this.text) {
         const t = document.createElement("span");
         t.innerText = this.text;
         t.classList.add("element");
         t.style.textAlign = "center";

         this.element.append(t);

         // Defer measurement until layout is ready
         requestAnimationFrame(() => {
            const minHeight = t.scrollHeight;
            console.log("Measured height:", minHeight);
            this.height = Math.max(minHeight, this.height);

            this.element.style.height = `${this.height}px`;
            this.element.style.display = "flex";
            this.element.style.justifyContent = "center";
            this.element.style.alignItems = "center";
         });

      }
      return this.Element();
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