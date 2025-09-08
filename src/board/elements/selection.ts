import type { Point, ShapeProps } from "../types";
import ShapeObject from "./element";

type SProps = {
   shapes?: ShapeObject[];
};

class Selection extends ShapeObject {
   declare shapes: ShapeObject[];
   constructor(props: ShapeProps & SProps) {
      super(props);
      this.shapes = props.shapes || [];
   }

   mousedup(e: { e: Point }): void {}
}

export default Selection;
