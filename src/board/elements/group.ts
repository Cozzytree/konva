import type { Point, ShapeProps } from "../types";
import ShapeObject from "./element";

type GroupProps = {
   shapes: ShapeObject[];
};

class GroupElement extends ShapeObject {
   declare shapes: ShapeObject[];
   constructor(props: ShapeProps & GroupProps) {
      super(props);
      this.shapes = props.shapes || [];
   }

   mousedown(e: { e: Point }): void {}

   mousedup(e: { e: Point }): void {}
}

export default GroupElement;
