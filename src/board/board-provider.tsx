import * as React from "react";
import type ShapeObject from "./elements/element";

export type Props = {
   activeShape: ShapeObject | null;

   setActiveShape: (s: ShapeObject | null) => void;
};

const BoardContext = React.createContext<Props | undefined>(undefined);

const BoardProvider = ({ children }: { children: React.ReactNode }) => {
   const [activeShape, setActiveShape] = React.useState<ShapeObject | null>(
      null,
   );
   return (
      <BoardContext.Provider value={{ activeShape, setActiveShape }}>
         {children}
      </BoardContext.Provider>
   );
};

const BoardOptions = () => {};

export { BoardProvider };
