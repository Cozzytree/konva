import type Board from "./board";
import type UI from "./ui";

export type Box = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type elementEvent = "mousedown" | "mouseover" | "mouseup";

export type resizeDirection = "l" | "b" | "t" | "r" | "tl" | "bl" | "br" | "tr";

export interface ElementInterface {
  ID(): string;

  IsDraggable(p: Point): boolean;

  IsResizable(p: Point): resizeDirection | null;

  Dragging(prev: Point, current: Point): void;

  Resizing(current: Point, old: Box, d: resizeDirection): void;

  Element(): HTMLElement;
}

export type Point = {
  x: number;
  y: number;
};

export type valign = "top" | "center" | "bottom";
export type halign = "left" | "center" | "right";

export type ShapeProps = {
  pageId: string;
  fontSize?: number;
  color?: string;
  strokeWidth?: number;
  padding?: number;
  _board: Board;
  element?: UI;
  id?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  text?: string;
  valign?: valign;
  halign?: halign;
};
