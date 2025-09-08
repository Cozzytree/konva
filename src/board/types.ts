export type Box = {
   x1: number;
   x2: number;
   y1: number;
   y2: number;
}

export type resizeDirection = "l" | "b" | "t" | "r" | "tl" | "bl" | "br" | "tr"

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
}

export type ShapeProps = {
   element?: HTMLElement;
   id?: string;
   left?: number;
   top?: number;
   width?: number;
   height?: number;
   stroke?: string;
   fill?: string;
   text?: string;
}