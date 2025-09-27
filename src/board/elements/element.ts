import { v4 as uuidv4 } from "uuid";
import type Board from "../board";
import type {
  Box,
  elementEvent,
  halign,
  Point,
  resizeDirection,
  ShapeProps,
  valign,
} from "../types";
import { resizeRect } from "../utils/reactResize";
import type UI from "../ui";

export type drawProps = {
  isActive?: boolean;
};

type EventCallbackProps = {
  e: Point;
};

type ElementStateProps = {
  isEdit: boolean;
};

type eventCallback = (_: EventCallbackProps) => void;

class ShapeObject implements ShapeProps {
  declare pageId: string;
  declare element: UI<ElementStateProps>;
  fontSize: number;
  strokeWidth: number;
  padding: number = 6;
  id: string;
  height: number;
  left: number;
  top: number;
  width: number;
  stroke: string;
  fill: string;
  text: string;
  halign: halign;
  valign: valign;
  private events: Map<elementEvent, eventCallback[]>;
  _board: Board;

  draw(): UI {
    return this.Element();
  }

  constructor(props: ShapeProps) {
    this.strokeWidth = props.strokeWidth || 2;
    this.id = uuidv4();
    this.height = props.height || 100;
    this.width = props.width || 100;
    this.left = props.left || 0;
    this.top = props.top || 0;
    this.stroke = props.stroke || "#202020";
    this.fill = props.fill || "transparent";
    this.text = props.text || "";
    this.halign = props.halign || "center";
    this.valign = props.valign || "center";
    this.events = new Map();
    this._board = props._board;
    this.fontSize = props.fontSize || 16;
    this.pageId = props.pageId;
  }

  mousedown(e: EventCallbackProps) {
    const subs = this.events.get("mousedown");
    if (subs) {
      subs.forEach((s) => {
        s(e);
      });
    }
  }

  clean() {
    this.element.remove();
  }

  mouseover(e: EventCallbackProps) {
    const subs = this.events.get("mouseover");
    if (subs) {
      subs.forEach((s) => {
        s(e);
      });
    }
    if (
      this._board.getActiveShape.shape &&
      this._board.getActiveShape.shape.ID() === this.ID()
    ) {
      const r = resizeRect(
        e.e,
        {
          x1: this.left,
          x2: this.left + this.width,
          y1: this.top,
          y2: this.top + this.height,
        },
        6,
      );
      if (r) {
        switch (r.rd) {
          case "tl":
          case "br":
            document.body.style.cursor = "nwse-resize";
            break;

          case "tr":
          case "bl":
            document.body.style.cursor = "nesw-resize";
            break;

          case "t":
          case "b":
            document.body.style.cursor = "ns-resize";
            break;

          case "l":
          case "r":
            document.body.style.cursor = "ew-resize";
            break;
        }
      }
    } else {
      document.body.style.cursor = "default";
    }
  }

  mouseup(e: EventCallbackProps) {
    const subs = this.events.get("mouseup");
    if (subs) {
      subs.forEach((s) => {
        s(e);
      });
    }
  }

  Element() {
    return this.element;
  }

  ID(): string {
    return this.id;
  }

  PageId(): string {
    return this.pageId;
  }

  Dragging(prev: Point, current: Point): void {
    const dx = current.x - prev.x;
    const dy = current.y - prev.y;

    this.left += dx;
    this.top += dy;
    this.element.css({
      left: `${this.left}px`,
      top: `${this.top}px`,
    });
  }

  IsDraggable(p: Point): boolean {
    return (
      p.x > this.left &&
      p.x < this.left + this.width &&
      p.y > this.top &&
      p.y < this.top + this.height
    );
  }

  IsResizable(p: Point): resizeDirection | null {
    const d = resizeRect(
      p,
      {
        x1: this.left,
        x2: this.left + this.width,
        y1: this.top,
        y2: this.top + this.height,
      },
      this.padding,
    );
    if (!d) {
      return null;
    }

    return d.rd;
  }

  Resizing(current: Point, old: Box, d: resizeDirection): void {
    switch (d) {
      case "l":
        if (current.x > old.x2) {
          this.left = old.x2;
          this.width = current.x - old.x2;
        } else {
          this.left = current.x;
          this.width = old.x2 - current.x;
        }
        break;
      case "r":
        if (current.x > old.x1) {
          this.left = old.x1;
          this.width = current.x - old.x1;
        } else {
          this.left = current.x;
          this.width = old.x1 - current.x;
        }
        break;
      case "b":
        if (current.y > old.y1) {
          this.top = old.y1;
          this.height = current.y - old.y1;
        } else {
          this.top = current.y;
          this.height = old.y1 - current.y;
        }
        break;
      case "t":
        if (current.y > old.y2) {
          this.top = old.y2;
          this.height = current.y - old.y2;
        } else {
          this.top = current.y;
          this.height = old.y2 - current.y;
        }
        break;
      case "tl":
        if (current.x > old.x2) {
          this.left = old.x2;
          this.width = current.x - old.x2;
        } else {
          this.left = current.x;
          this.width = old.x2 - current.x;
        }

        if (current.y > old.y2) {
          this.top = old.y2;
          this.height = current.y - old.y2;
        } else {
          this.top = current.y;
          this.height = old.y2 - current.y;
        }
        break;
      case "tr":
        if (current.x < old.x1) {
          this.left = current.x;
          this.width = old.x1 - current.x;
        } else {
          this.left = old.x1;
          this.width = current.x - old.x1;
        }

        if (current.y > old.y2) {
          this.top = old.y2;
          this.height = current.y - old.y2;
        } else {
          this.top = current.y;
          this.height = old.y2 - current.y;
        }
        break;
      case "br":
        if (current.x < old.x1) {
          this.left = current.x;
          this.width = old.x1 - current.x;
        } else {
          this.left = old.x1;
          this.width = current.x - old.x1;
        }

        if (current.y > old.y1) {
          this.top = old.y1;
          this.height = current.y - old.y1;
        } else {
          this.top = current.y;
          this.height = old.y1 - current.y;
        }
        break;
      case "bl":
        if (current.x > old.x2) {
          this.left = old.x2;
          this.width = current.x - old.x2;
        } else {
          this.left = current.x;
          this.width = old.x2 - current.x;
        }
        if (current.y > old.y1) {
          this.top = old.y1;
          this.height = current.y - old.y1;
        } else {
          this.top = current.y;
          this.height = old.y1 - current.y;
        }
    }

    this.element.css({
      left: `${this.left}px`,
      top: `${this.top}px`,
      width: `${this.width}px`,
      height: `${this.height}px`,
    });
  }
}

export default ShapeObject;
