import type ShapeObject from "./elements/element";
import Page from "./page";
import Store from "./store";
import UI from "./ui";

type Props = {
   width: number;
   height: number;
   container: HTMLDivElement;
};

const attrs = {
   option: "data-option",
};

class Board {
   private focuesdPage: Page | null;
   declare view: { x: number; y: number; scl: number };
   declare container: UI;
   private handleWheel: (e: WheelEvent) => void;
   private handleMouseDown: (e: PointerEvent | MouseEvent) => void;
   private handleMouseMove: (e: PointerEvent | MouseEvent) => void;
   private handleMouseUp: (e: PointerEvent | MouseEvent) => void;
   private pages: Store<Page>;
   private activeShape: { el: UI; shape: ShapeObject | null };
   private optionUI: UI;
   // hoveredShape : HTMLDivElement;
   evt = {
      x: -2,
      y: -2,
      dx: 0,
      dy: 0,
      delta: 0,
      btn: 0,
   };

   constructor(props: Props) {
      this.view = { scl: 1, x: 0, y: 0 };
      this.focuesdPage = null;

      this.activeShape = {
         el: this.initActiveBox({ boxSize: 8 }),
         shape: null,
      };

      this.container = new UI({
         tag: "div",
         styles: {
            position: "relative",
            display: "flex",
            transform: `scale(${this.view.scl})`,
            flexDirection: "column",
            alignItems: "center",
            gap: "50px",
         },
      });

      this.pages = new Store();
      this.pages.insert(
         [
            new Page({ width: props.width / 2.4, height: 900, board: this }),
            new Page({ width: props.width / 2.4, height: 900, board: this }),
         ],
         (v) => {
            console.info("ew page inserted ", v.ID());
         },
      );

      this.optionUI = this.initOptions();
      props.container.append(this.container.el);
      this.container.append(this.optionUI);

      this.handleMouseDown = this.onmousedown.bind(this);
      this.handleMouseMove = this.onmousemove.bind(this);
      this.handleMouseUp = this.onmouseup.bind(this);
      this.handleWheel = this.onwheel.bind(this);

      window.addEventListener("wheel", this.handleWheel, { passive: false });
      document.addEventListener("pointerdown", this.handleMouseDown);
      document.addEventListener("pointermove", this.handleMouseMove);
      document.addEventListener("pointerup", this.handleMouseUp);
      this.pages.forEach((p) => {
         this.container.append(p.container);
      });
      if (this.activeShape.el) this.container.append(this.activeShape.el);
   }

   clean() {
      window.removeEventListener("wheel", this.handleWheel);
      document.removeEventListener("pointerdown", this.handleMouseDown);
      document.removeEventListener("pointermove", this.handleMouseDown);
      document.removeEventListener("pointerup", this.handleMouseUp);
      this.pages.forEach((p) => p.clean());
      this.container.remove();
   }

   private isActiveShape() {
      return this.activeShape.shape ? true : false;
   }

   private initActiveBox({ boxSize = 10 }: { boxSize?: number }) {
      const mid = Math.floor(boxSize / 2);
      const options = new UI({
         tag: "div",
         styles: {
            position: "absolute",
            width: "fit-content",
            padding: "0.4rem",
            borderRadius: "0.2rem",
            left: "50%",
            top: "-40px",
            transform: `translate(-50%)`,
         },
      }).append(
         new UI({
            tag: "button",
            html: "hello",
         }),
      );

      const b = new UI({
         tag: "div",
         updater: () => {
            b.class("hidden", !this.isActiveShape());
            console.log(this.isActiveShape());
         },
         styles: {
            border: "1px solid #202020",
            position: "absolute",
            pointerEvents: "none",
         },
         className: "hidden",
      });

      const b1 = new UI({
         styles: {
            position: "relative",
            width: "100%",
            height: "100%",
         },
      })
         .append(
            new UI({
               styles: {
                  position: "absolute",
                  left: `-${mid}px`,
                  top: `-${mid}px`,
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  background: "red",
               },
            }),
         )
         .append(
            new UI({
               styles: {
                  position: "absolute",
                  left: `calc(100% - ${mid}px)`,
                  top: `-${mid}px`,
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  background: "red",
               },
            }),
         )
         .append(
            new UI({
               styles: {
                  position: "absolute",
                  left: `-${mid}px`,
                  top: `calc(100% - ${mid}px)`,
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  background: "red",
               },
            }),
         )
         .append(
            new UI({
               styles: {
                  position: "absolute",
                  left: `calc(100% - ${mid}px)`,
                  top: `calc(100% - ${mid}px)`,
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  background: "red",
               },
            }),
         )
         .append(options);

      b.append(b1);

      return b;
   }

   private initOptions() {
      return new UI({
         attrs: { "data-option": "board-option" },
         className: "k-option",
         styles: {
            position: "fixed",
            left: "50%",
            top: "-3%",
            transform: "translate(-50%, -50%)",
            width: "fit-cnotent",
            display: "flex",
            justifyContent: "justify-between",
            alignItems: "center",
         },
      }).append(
         new UI({
            tag: "span",
            html: "hello",
         }),
      );
   }

   private getPageClick(e: MouseEvent | PointerEvent) {
      const target = e.target as HTMLElement;
      if (!target) return null;

      if (this.focuesdPage) {
         const optionAttr = target.getAttribute(attrs.option);
         if (optionAttr) {
            return this.focuesdPage;
         }
      }

      const pageid = target.getAttribute("data-page");
      if (!pageid) return;

      return this.pages.getById(pageid);
   }

   private renderActiveBox() {
      if (this.focuesdPage && this.activeShape.shape) {
         const pageEl = this.focuesdPage.container.el; // inner content holder
         const pageRect = pageEl.getBoundingClientRect();
         const boardRect = this.container.el.getBoundingClientRect();

         const style = getComputedStyle(pageEl);
         const paddingLeft = parseFloat(style.paddingLeft);
         const paddingTop = parseFloat(style.paddingTop);

         // Offset inside board (includes border + padding)
         const offsetX =
            pageRect.left - boardRect.left + pageEl.clientLeft + paddingLeft;
         const offsetY =
            pageRect.top - boardRect.top + pageEl.clientTop + paddingTop;

         const s = this.activeShape.shape;

         this.activeShape.el.class("hidden", false);
         this.activeShape.el.css({
            width: `${s.width + s.padding}px`,
            height: `${s.height + s.padding}px`,
            left: `${offsetX + s.left}px`,
            top: `${offsetY + s.top}px`,
         });
      }
   }

   getTransformedCoords(e: MouseEvent | PointerEvent | TouchEvent) {
      const rect = this.container.el.getBoundingClientRect();
      let clientX,
         clientY,
         btn = 0;

      if ("touches" in e && e.touches.length > 0) {
         const t = e.touches[0];
         clientX = t.clientX;
         clientY = t.clientY;
      } else {
         clientX = (e as MouseEvent).clientX;
         clientY = (e as MouseEvent).clientY;
         btn =
            (e as MouseEvent).buttons !== undefined
               ? (e as MouseEvent).buttons
               : (e as MouseEvent).button;
      }

      const rawX = clientX - Math.floor(rect.left);
      const rawY = clientY - Math.floor(rect.top);

      this.evt.x = rawX;
      this.evt.y = rawY;
      this.evt.btn = btn - this.evt.btn;
      if (e.type === "wheel") {
         const we = e as WheelEvent;
         this.evt.delta = Math.max(-1, Math.min(1, we.deltaY)) || 0;
      }
      return {
         x: (rawX - this.view.x) / this.view.scl,
         y: (rawY - this.view.y) / this.view.scl,
      };
   }

   onmousedown(e: PointerEvent | MouseEvent) {
      this.getTransformedCoords(e);

      const page = this.getPageClick(e);
      if (page && !page.isLocked) {
         this.optionUI.class("hidden", false);
         page.onmousedown(e);
         page.container.el.classList.add("focused");
         this.focuesdPage = page;
         this.pages.forEach((p) => {
            if (p.ID() !== page.ID()) {
               p.container.el.classList.remove("focused");
            }
         });

         // check activeshape
         this.renderActiveBox();
         return;
      } else {
         this.optionUI.class("hidden", true);
         this.pages.forEach((p) => {
            p.container.el.classList.remove("focused");
         });
         this.focuesdPage = null;
      }
   }

   onmousemove(e: PointerEvent | MouseEvent) {
      this.getTransformedCoords(e);
      if (this.focuesdPage) {
         this.focuesdPage.onmousemove(e);
         if (this.activeShape.shape) {
            this.renderActiveBox();
         }
         return;
      }
   }

   onmouseup(e: PointerEvent | MouseEvent) {
      if (this.focuesdPage) {
         this.focuesdPage.onmouseup(e);
      }
   }

   onwheel(e: WheelEvent) {
      if (e.ctrlKey) {
         e.preventDefault();
         if (e.deltaY > 0) {
            this.view.scl += 0.2;
         } else {
            this.view.scl -= 0.2;
         }
         this.container.css({
            transform: `scale(${this.view.scl})`,
         });
      }
   }

   set setActiveShape(s: ShapeObject | null) {
      this.activeShape.shape = s;
      this.activeShape.el.update();
   }

   get getActiveShape() {
      return this.activeShape;
   }

   set setFocusedPage(s: Page | null) {
      this.focuesdPage = s;
   }
}

export default Board;
