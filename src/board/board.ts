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
   private activeShape: ShapeObject | null;
   private optionUI: UI;
   // hoveredShape : HTMLDivElement;

   constructor(props: Props) {
      this.view = { scl: 1, x: 0, y: 0 };
      this.focuesdPage = null;
      this.activeShape = null;
      this.container = new UI({
         tag: "div",
         styles: {
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
      props.container.append(this.container.getParent);
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
   }

   clean() {
      window.removeEventListener("wheel", this.handleWheel);
      document.removeEventListener("pointerdown", this.handleMouseDown);
      document.removeEventListener("pointermove", this.handleMouseDown);
      document.removeEventListener("pointerup", this.handleMouseUp);
      this.pages.forEach((p) => p.clean());
      this.container.remove();
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

   onmousedown(e: PointerEvent | MouseEvent) {
      const page = this.getPageClick(e);
      if (page && !page.isLocked) {
         this.optionUI.class("hidden", false);
         page.onmousedown(e);
         page.container.getParent.classList.add("focused");
         this.focuesdPage = page;
         this.pages.forEach((p) => {
            if (p.ID() !== page.ID()) {
               p.container.getParent.classList.remove("focused");
            }
         });
         return;
      } else {
         this.optionUI.class("hidden");
         this.pages.forEach((p) => {
            p.container.getParent.classList.remove("focused");
         });
         this.focuesdPage = null;
      }
   }

   onmousemove(e: PointerEvent | MouseEvent) {
      if (this.focuesdPage) {
         this.focuesdPage.onmousemove(e);
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
         this.container.setStyle({
            transform: `scale(${this.view.scl})`,
         });
      }
   }

   set setActiveShape(s: ShapeObject) {
      this.activeShape = s;
   }

   get getActiveShape() {
      return this.activeShape;
   }

   set setFocusedPage(s: Page | null) {
      this.focuesdPage = s;
   }
}

export default Board;
