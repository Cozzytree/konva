import { v4 as uuidv4 } from "uuid";
import type Board from "./board";
import type ShapeObject from "./elements/element";
import Header from "./elements/header";
import Store from "./store";
import type { Box, Point, resizeDirection } from "./types";
import UI from "./ui";
import Text from "./elements/text";

type Props = {
   width: number;
   height: number;
   board: Board;
   title?: string;
};

class Page {
   container: UI;
   private title: string;
   private locked: boolean;
   private id: string;
   private _board: Board;
   private lastPoint: Point = { x: 0, y: 0 };
   private pageContainer: UI;
   declare width: number;
   declare height: number;
   declare elements: Store<ShapeObject>;

   declare resizeElement: {
      e: ShapeObject;
      old: Box;
      d: resizeDirection;
   } | null;
   declare draggedElement: ShapeObject | null;
   declare optionUI: UI;

   constructor(props: Props) {
      this.title = props?.title || "page";
      this.locked = false;
      this.id = uuidv4();
      this.elements = new Store();
      this._board = props.board;
      this.width = props.width;
      this.height = props.height;

      // main container
      this.container = new UI({
         tag: "div",
         className: "page",
         styles: {
            width: `${this.width}px`,
            height: `${this.height}px`,
         },
      });

      // page
      this.pageContainer = new UI({
         className: "page",
         styles: {
            width: `100%`,
            height: `100%`,
            overflow: "hidden",
         },
         attrs: {
            "data-page": this.id,
         },
         tag: "div",
      });

      // options ui
      this.optionUI = this.initOptions();

      this.container.append(this.pageContainer);
      this.container.append(this.optionUI);

      this.insert(
         new Header({
            _board: this._board,
            left: 0,
            top: 0,
            text: "Hello world\nIm here all i do i stay!!\nHello world this is a game",
         }),
         new Header({
            _board: this._board,
            left: 0,
            top: 0,
            strokeWidth: 0,
            text: "Hello world",
         }),
         new Header({
            _board: this._board,
            text: "Hello Seattle",
            left: 100,
            top: 100,
            width: 100,
            height: 100,
         }),
         new Text({
            _board: this._board,
            left: 100,
            top: 150,
            text: "Heading",
         }),
      );
   }

   private initOptions() {
      const btn = new UI({
         tag: "button",
         html: this.getLockHtml(), // initial render
         updater: () => {
            btn.html(this.getLockHtml()); // recompute every update
         },
      }).on("click", () => {
         this.setLocked = !this.locked;
         this._board.setFocusedPage = this.locked ? null : this;
         btn.update(); // re-render with new value
      });

      const titleDiv = new UI({
         tag: "div",
      }).append(
         new UI({
            tag: "h2",
            className: "k-title",
         })
            .setText(this.title)
            .on("click", ({ e, ui }) => {
               ui.el.contentEditable = "true";
            })
            .on("blur", ({ ui }) => {
               this.title = ui.el.innerText;
               ui.el.contentEditable = "false";
            }),
      );

      return new UI({
         tag: "div",
         styles: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            position: "absolute",
            top: "-5%",
            padding: "2px 4px",
         },
      })
         .append(titleDiv)
         .append(btn);
   }

   private getLockHtml() {
      return `<img
       class="k-icon"
       alt="${this.isLocked}"
       src="${this.isLocked ? "./lock.svg" : "./unlock.svg"}"
     />`;
   }

   ID() {
      return this.id;
   }

   get isLocked() {
      return this.locked;
   }

   set setLocked(l: boolean) {
      this.locked = l;
   }

   getTransformedCoords(e: MouseEvent | PointerEvent) {
      const box = this.pageContainer.el.getBoundingClientRect();
      // if (
      //    e.clientX < box.left ||
      //    e.clientX > box.right ||
      //    e.clientY < box.top ||
      //    e.clientY > box.bottom
      // ) {
      //    return null;
      // }

      return {
         x: (e.clientX - box.left) / this._board.view.scl,
         y: (e.clientY - box.top) / this._board.view.scl,
      };
   }

   onmousedown(e: MouseEvent | PointerEvent) {
      // if (!this.contentContainer.contains(e.target as Node)) {
      //    return; // Ignore clicks from outside
      // }
      const point = this.getTransformedCoords(e);
      this.lastPoint = point;

      // check is active shape is resizable or draggable
      const ac = this._board.getActiveShape.shape;
      if (ac) {
         const r = ac.IsResizable(point);
         if (r) {
            this.resizeElement = {
               d: r,
               e: ac,
               old: {
                  x1: ac.left,
                  x2: ac.left + ac.width,
                  y1: ac.top,
                  y2: ac.top + ac.height,
               },
            };
            return;
         }
         if (ac.IsDraggable(point)) {
            this.draggedElement = ac;
            return;
         }
      }

      // check the last inserted shape in store if draggable
      const getLastInserted = this.elements.getLastInserted;
      if (getLastInserted) {
         const resize = getLastInserted.IsResizable(point);
         if (resize) {
            this.resizeElement = {
               d: resize,
               e: getLastInserted,
               old: {
                  x1: getLastInserted.left,
                  x2: getLastInserted.left + getLastInserted.width,
                  y1: getLastInserted.top,
                  y2: getLastInserted.top + getLastInserted.height,
               },
            };
            getLastInserted.mousedown({ e: point });
            this._board.setActiveShape = getLastInserted;
            return;
         }

         const d = getLastInserted.IsDraggable(point);
         if (d) {
            this.draggedElement = getLastInserted;
            this._board.setActiveShape = getLastInserted;
            getLastInserted.mousedown({ e: point });
            return;
         }
      }

      this.lastPoint = point;

      this.getTransformedCoords(e);
      const element = this.elements.forEach((e) => {
         if (e.IsDraggable(point)) {
            return true;
         }
      });

      if (element) {
         this._board.setActiveShape = element;
         this.draggedElement = element;
      }

      if (!this.draggedElement && !this.resizeElement) {
         this._board.setActiveShape = null;
      }
   }

   onmousemove(e: MouseEvent | PointerEvent) {
      const point = this.getTransformedCoords(e);

      if (this.draggedElement) {
         this.draggedElement.Dragging(this.lastPoint, point);
         this.lastPoint = point;
         document.body.style.cursor = "grab";
         return;
      }

      if (this.resizeElement) {
         this.resizeElement.e.Resizing(
            point,
            this.resizeElement.old,
            this.resizeElement.d,
         );
         return;
      }

      this.elements.forEach((el) => {
         if (el.IsDraggable(point)) {
            el.mouseover({ e: point });
            return true;
         }
      });
   }

   onmouseup(e: PointerEvent | MouseEvent) {
      const point = this.getTransformedCoords(e);
      if (this.draggedElement) {
         this.draggedElement.mouseup({ e: point });
      }

      if (this.resizeElement) {
         this.resizeElement.e.mouseup({ e: point });
      }

      document.body.style.cursor = "default";
      this.draggedElement = null;
      this.resizeElement = null;
   }

   insert(...values: ShapeObject[]) {
      this.elements.insert(values, (v) => {
         this.pageContainer.append(v.draw());
         // this.contentContainer.append(v.draw());
      });
   }

   clean() {
      this.elements.forEach((e) => {
         e.clean();
      });
      this.container.remove();
   }

   get(key: keyof this) {
      return this[key];
   }

   set(key: keyof this, val: any) {
      this[key] = val;
   }
}

export default Page;
