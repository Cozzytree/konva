import UI from "./ui";

function initiColorOption(fn: (v: string) => void) {
   const colorUi = new UI({
      tag: "input",
      attrs: {
         type: "color",
      },
   }).on("change", (v) => {
      console.log(v);
   });
   return colorUi;
}

export { initiColorOption };
