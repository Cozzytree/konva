class UI {
   parent: HTMLElement;
   private listeners: [string, EventListenerOrEventListenerObject][] = [];
   private updater?: () => void;

   constructor(props: {
      styles?: Partial<CSSStyleDeclaration>;
      className?: string;
      attrs?: Record<string, string>;
      html?: string;
      tag?: string;
      updater?: () => void;
   }) {
      this.parent = document.createElement(props.tag ?? "div");

      if (props.styles) {
         Object.assign(this.parent.style, props.styles);
      }

      if (props.className) {
         this.parent.className = props.className;
      }

      if (props.attrs) {
         Object.entries(props.attrs).forEach(([k, v]) =>
            this.parent.setAttribute(k, v),
         );
      }

      if (props.html) {
         this.parent.innerHTML = props.html;
      }

      if (props.updater) {
         this.updater = props.updater;
      }
   }

   update() {
      if (this.updater) this.updater();
      return this;
   }

   html(content?: string) {
      if (content !== undefined) {
         this.parent.innerHTML = content;
         return this;
      }
      return this.parent.innerHTML;
   }

   css(styles: Partial<CSSStyleDeclaration>) {
      Object.assign(this.parent.style, styles);
      return this;
   }

   class(name: string, state?: boolean) {
      if (state === undefined) {
         this.parent.classList.toggle(name);
      } else if (state) {
         this.parent.classList.add(name);
      } else {
         this.parent.classList.remove(name);
      }
      return this;
   }

   on<K extends keyof HTMLElementEventMap>(
      event: K,
      handler: (ev: HTMLElementEventMap[K]) => void,
   ) {
      this.parent.addEventListener(event, handler);
      this.listeners.push([event, handler as any]);
      return this;
   }

   append(child: UI) {
      this.parent.append(child.parent);
      return this;
   }

   setStyle(styles: Partial<CSSStyleDeclaration>) {
      Object.entries(styles).forEach(([key, value]) => {
         (this.parent.style as any)[key] = value as string;
      });
   }

   remove() {
      // cleanup listeners
      this.listeners.forEach(([type, handler]) => {
         this.parent.removeEventListener(type, handler);
      });

      this.listeners = [];

      this.parent.remove();
      return this;
   }

   get getParent() {
      return this.parent;
   }
}

export default UI;
