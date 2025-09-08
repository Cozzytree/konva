import { useEffect, useRef } from "react";
import Board from "./board/board";

function App() {
   const bref = useRef<Board | null>(null);
   const divRef = useRef<HTMLDivElement | null>(null);
   useEffect(() => {
      if (!divRef.current) return;
      bref.current = new Board({
         width: window.innerWidth,
         height: window.innerHeight,
         container: divRef.current,
      });

      return () => {
         bref.current?.clean();
      };
   }, []);
   return (
      <div style={{}}>
         <div style={{ padding: "20px" }} ref={divRef}></div>
      </div>
   );
}

export default App;
