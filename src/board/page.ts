import type ShapeObject from "./elements/element";
import Header from "./elements/header";
import Store from "./store";
import type { Box, Point, resizeDirection } from "./types";

type Props = {
   width: number;
   height: number;
};

class Page {
   private lastPoint: Point = { x: 0, y: 0 };
   declare width: number;
   declare contentContainer: HTMLDivElement;
   declare height: number;
   declare elements: Store<ShapeObject>

   declare resizeElement: { e: ShapeObject, old: Box, d: resizeDirection } | null;
   declare draggedElement: ShapeObject | null;

   private handlemousedown: (e: MouseEvent | PointerEvent) => void;
   private handlemouseup: (e: MouseEvent | PointerEvent) => void;
   private handlemousemove: (e: MouseEvent | PointerEvent) => void;

   constructor(props: Props) {
      this.elements = new Store();
      this.width = props.width;
      this.height = props.height;
      this.contentContainer = document.createElement("div");
      this.contentContainer.setAttribute("data-page", Date.now().toString());
      this.contentContainer.style.position = "relative";
      this.contentContainer.style.width = `${this.width}px`;
      this.contentContainer.style.height = `${this.height}px`;
      this.contentContainer.style.border = `1px solid #222222`;
      this.contentContainer.style.overflow = "hidden";

      this.handlemousedown = this.onmousedown.bind(this);
      this.handlemousemove = this.onmousemove.bind(this);
      this.handlemouseup = this.onmouseup.bind(this);

      this.insert(new Header())
   }

   init() {
      this.contentContainer.addEventListener("pointerdown", this.handlemousedown);
      this.contentContainer.addEventListener("pointermove", this.handlemousemove)
      this.contentContainer.addEventListener("pointerup", this.handlemouseup);
   }

   getTransformedCoords(e: MouseEvent | PointerEvent) {
      const box = this.contentContainer.getBoundingClientRect();
      if (
         e.clientX < box.left ||
         e.clientX > box.right ||
         e.clientY < box.top ||
         e.clientY > box.bottom
      ) {
         return null;
      }

      return { x: e.clientX - box.left, y: e.clientY - box.top };
   }

   onmousedown(e: MouseEvent | PointerEvent) {
      if (!this.contentContainer.contains(e.target as Node)) {
         return; // Ignore clicks from outside
      }
      const point = this.getTransformedCoords(e);
      if (point == null) return;


      const getLastInserted = this.elements.getLastInserted;
      if (getLastInserted) {
         const resize = getLastInserted.IsResizable(point);
         console.log(resize);
         if (resize) {
            this.resizeElement = {
               d: resize, e: getLastInserted, old: {
                  x1: getLastInserted.left,
                  x2: getLastInserted.left + getLastInserted.width,
                  y1: getLastInserted.top,
                  y2: getLastInserted.top + getLastInserted.height
               }
            }
            return;
         }
      }

      this.lastPoint = point;

      this.getTransformedCoords(e)
      const element = this.elements.forEach((e) => {
         if (e.IsDraggable(point)) {
            return true;
         }
      })

      if (element) {
         this.draggedElement = element;
      }
      console.log(element);
   }

   onmousemove(e: MouseEvent | PointerEvent) {
      const point = this.getTransformedCoords(e);
      if (point == null) return;

      if (this.draggedElement) {
         this.draggedElement.Dragging(this.lastPoint, point)
         this.lastPoint = point;
         return;
      }

      if (this.resizeElement) {
         this.resizeElement.e.Resizing(point, this.resizeElement.old, this.resizeElement.d)
      }
   }

   onmouseup(e: PointerEvent | MouseEvent) {
      this.draggedElement = null;
      this.resizeElement = null;
   }

   insert(...values: ShapeObject[]) {
      this.elements.insert(values, (v) => {
         this.contentContainer.append(v.Element());
      });
   }

   clean() {
      this.contentContainer.removeEventListener("pointerdown", this.handlemousedown);
      this.contentContainer.removeEventListener("pointermove", this.handlemousemove);
      this.contentContainer.remove();
   }
}

export default Page;
