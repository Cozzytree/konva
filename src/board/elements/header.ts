import type { Box, Point, resizeDirection, ShapeProps } from "../types";
import UI from "../ui";
import ShapeObject, { type drawProps } from "./element";

class Header extends ShapeObject {
   constructor(props: ShapeProps) {
      super(props || {});
      this.element = new UI({
         tag: "div",
         className: "element",
         styles: {
            position: "absolute",
            left: `${this.left}px`,
            top: `${this.top}px`,
            width: `${this.width}px`,
            height: `${this.height}px`,
            border: `${this.strokeWidth}px solid ${this.stroke}`,
         },
      });
   }

   draw(props: drawProps) {
      if (this.text) {
         const content = new UI({
            tag: "span",
            styles: {
               textAlign: "center",
            },
            className: "element",
         }).setText(this.text);

         this.element.append(content);

         // Defer measurement until layout is ready
         requestAnimationFrame(() => {
            const minHeight = content.el.scrollHeight;
            this.height = Math.max(minHeight, this.height);

            let al = "center";
            if (this.valign == "bottom") {
               al = "end";
            } else if (this.valign === "top") {
               al = "start";
            }

            this.element.css({
               height: `${this.height}px`,
               display: "flex",
               justifyContent: "center",
               alignItems: al,
            });
         });
      }
      return this.Element();
   }

   IsResizable(p: Point): resizeDirection | null {
      return super.IsResizable(p);
   }

   Resizing(current: Point, old: Box, d: resizeDirection): void {
      super.Resizing(current, old, d);
   }

   IsDraggable(p: Point): boolean {
      return (
         p.x > this.left &&
         p.x < this.left + this.width &&
         p.y > this.top &&
         p.y < this.top + this.height
      );
   }

   Dragging(prev: Point, current: Point): void {
      super.Dragging(prev, current);
   }
}

export default Header;
