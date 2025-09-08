import type ShapeObject from "./elements/element";
import Page from "./page";

type Props = {
   width: number;
   height: number;
   container: HTMLDivElement;
};

class Board {
   declare view: { x: number; y: number; scl: number };
   declare container: HTMLDivElement;
   private handleWheel: (e: WheelEvent) => void;
   private handleMouseDown: (e: PointerEvent | MouseEvent | TouchEvent) => void;
   private handleMouseMove: (e: PointerEvent | MouseEvent | TouchEvent) => void;
   private pages: Page[];
   activeShape: ShapeObject | null;
   // hoveredShape : HTMLDivElement;

   constructor(props: Props) {
      this.view = { scl: 1, x: 0, y: 0 };
      this.activeShape = null;
      this.container = props.container;
      // this.container.style.width = `${props.width}px`;
      // this.container.style.height = `${props.height}px`;
      this.container.style.display = "flex";
      this.container.style.transform = `scale(${this.view.scl})`

      this.container.style.flexDirection = "column";
      this.container.style.alignItems = "center";
      this.container.style.gap = "20px";

      this.pages = [
         new Page({ width: props.width / 2, height: 800, board: this }),
      ];
      this.handleMouseDown = this.onmousedown.bind(this);
      this.handleMouseMove = this.onmousemove.bind(this);
      this.handleWheel = this.onwheel.bind(this);

      window.addEventListener("wheel", this.handleWheel, { passive: false });
      this.container.addEventListener("pointerdown", this.handleMouseDown);
      this.container.addEventListener("pointermove", this.handleMouseMove);
      this.pages.forEach((p) => {
         this.container.append(p.contentContainer);
         p.init();
      });
   }

   clean() {
      window.removeEventListener("wheel", this.handleWheel);
      this.container.removeEventListener("pointerdown", this.handleMouseDown);
      this.container.removeEventListener("pointermove", this.handleMouseDown);
      this.pages.forEach((p) => p.clean());
   }

   onmousedown(e: PointerEvent | MouseEvent | TouchEvent) { }

   onmousemove(e: PointerEvent | MouseEvent | TouchEvent) { }

   onwheel(e: WheelEvent) {
      if (e.ctrlKey) {
         e.preventDefault();
         if (e.deltaY > 0) {
            this.view.scl += 0.2;
         } else {
            this.view.scl -= 0.2;
         }
         this.container.style.transform = `scale(${this.view.scl})`
      }
   }
}

export default Board;
