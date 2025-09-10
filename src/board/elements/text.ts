import type { Point, ShapeProps } from "../types";
import UI from "../ui";
import ShapeObject, { type drawProps } from "./element";

class Text extends ShapeObject {
   constructor(props: ShapeProps) {
      super(props);
      this.element = this.initShape();
   }

   draw(_: drawProps): UI {
      return super.Element();
   }

   private initShape() {
      const spanText = new UI({
         tag: "span",
         className: "element",
      }).setText(this.text);

      const ui = new UI({
         tag: "div",
         updater: () => {
            this.element.css({
               height: `${spanText.el.clientHeight}px`,
            });
         },
         styles: {
            fontSize: `${this.fontSize}px`,
            position: "absolute",
            left: `${this.left}px`,
            top: `${this.top}px`,
            width: `${this.width}px`,
         },
         className: "element",
      }).append(spanText);

      requestAnimationFrame(() => {
         ui.css({
            height: `${spanText.el.clientHeight}px`,
         });
      });

      return ui;
   }

   IsDraggable(p: Point): boolean {
      return super.IsDraggable(p);
   }

   Dragging(prev: Point, current: Point): void {
      super.Dragging(prev, current);
   }
}

export default Text;
