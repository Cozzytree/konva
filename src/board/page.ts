import type Board from "./board";
import type ShapeObject from "./elements/element";
import Header from "./elements/header";
import Store from "./store";
import type { Box, Point, resizeDirection } from "./types";

type Props = {
   width: number;
   height: number;
   board: Board
};

class Page {
   private _board: Board;
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
      this._board = props.board;
      this.width = props.width;
      this.height = props.height;
      this.contentContainer = document.createElement("div");
      this.contentContainer.setAttribute("data-page", Date.now().toString());
      this.contentContainer.style.width = `${this.width}px`;
      this.contentContainer.style.height = `${this.height}px`;
      this.contentContainer.classList.add("page")

      this.handlemousedown = this.onmousedown.bind(this);
      this.handlemousemove = this.onmousemove.bind(this);
      this.handlemouseup = this.onmouseup.bind(this);

      this.insert(
         new Header({
            _board: this._board,
            left: 0,
            top: 0,
            text: "Hello world\nIm here all i do i stay!!\nHello world this is a game"
         }),
         new Header({
            _board: this._board,
            left: 0,
            top: 0,
         }),
         new Header({
            _board: this._board,
            text: "Hello Seattle",
            left: 100,
            top: 100,
            width: 100,
            height: 100
         })
      )
   }

   init() {
      this.contentContainer.addEventListener("pointerdown", this.handlemousedown);
      document.addEventListener("pointermove", this.handlemousemove)
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

      return { x: (e.clientX - box.left) / this._board.view.scl, y: (e.clientY - box.top) / this._board.view.scl };
   }

   onmousedown(e: MouseEvent | PointerEvent) {
      if (!this.contentContainer.contains(e.target as Node)) {
         return; // Ignore clicks from outside
      }
      const point = this.getTransformedCoords(e);
      if (point == null) return;
      this.lastPoint = point;

      if (this._board.activeShape) {
         
         const r = this._board.activeShape.IsResizable(point)
         if (r) {
            this.resizeElement = {
               d: r,
               e: this._board.activeShape,
               old: {
                  x1: this._board.activeShape.left,
                  x2: this._board.activeShape.left + this._board.activeShape.width,
                  y1: this._board.activeShape.top,
                  y2: this._board.activeShape.top + this._board.activeShape.height,
               } 
            }
            return
         }
      }

      const getLastInserted = this.elements.getLastInserted;
      if (getLastInserted) {
         const resize = getLastInserted.IsResizable(point);
         if (resize) {
            this.resizeElement = {
               d: resize, e: getLastInserted, old: {
                  x1: getLastInserted.left,
                  x2: getLastInserted.left + getLastInserted.width,
                  y1: getLastInserted.top,
                  y2: getLastInserted.top + getLastInserted.height
               }
            }
            getLastInserted.mousedown({ e: point })
            this._board.activeShape = getLastInserted;
            return;
         }

         const d = getLastInserted.IsDraggable(point);
         if (d) {
            this.draggedElement = getLastInserted;
            this._board.activeShape = getLastInserted;
            getLastInserted.mousedown({ e: point })
            return
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
         this._board.activeShape = element;
         this.draggedElement = element;
      }
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
         return;
      }

      this.elements.forEach((el) => {
         if (el.IsDraggable(point)) {
            el.mouseover({ e: point });
         }
      })
   }

   onmouseup(e: PointerEvent | MouseEvent) {
      const point = this.getTransformedCoords(e)
      if (!point) return;
      if (this.draggedElement) {
         this.draggedElement.mousedup({ e: point })
      }
      console.log(this._board.activeShape);
      this.draggedElement = null;
      this.resizeElement = null;
   }

   insert(...values: ShapeObject[]) {
      this.elements.insert(values, (v) => {
         this.contentContainer.append(v.draw());
      });
   }

   clean() {
      this.contentContainer.removeEventListener("pointerdown", this.handlemousedown);
      document.removeEventListener("pointermove", this.handlemousemove);
      this.elements.forEach((e) => {
         e.clean();
      })
      this.contentContainer.remove();
   }
}

export default Page;
