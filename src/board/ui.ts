type UIEventHandler<
   K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
> = (props: { e: HTMLElementEventMap[K]; ui: UI }) => void;

class UI<State = any> {
   private listeners: {
      type: keyof HTMLElementEventMap;
      handler: UIEventHandler<any>;
      wrapped: EventListener;
   }[] = [];
   private updater?: () => void;
   private children: UI[] = [];
   private state: State;

   readonly el: HTMLElement;

   constructor(props: {
      styles?: Partial<CSSStyleDeclaration>;
      className?: string;
      attrs?: Record<string, string>;
      html?: string;
      tag?: keyof HTMLElementTagNameMap;
      initialState?: State;
      updater?: () => void;
   }) {
      this.el = document.createElement(props.tag ?? "div");

      if (props.styles) Object.assign(this.el.style, props.styles);
      if (props.className) {
         this.el.className = props.className;
      }
      if (props.attrs)
         Object.entries(props.attrs).forEach(([k, v]) =>
            this.el.setAttribute(k, v),
         );
      if (props.html) this.el.innerHTML = props.html;
      if (props.updater) this.updater = props.updater;

      this.state = props.initialState as State;
   }

   /** Get current state */
   getState(): State {
      return this.state;
   }

   /** Replace state (triggers re-render) */
   setState(newState: State) {
      this.state = newState;
      this.update();
      return this;
   }

   /** Partial update like React’s setState */
   patchState(partial: Partial<State>) {
      this.state = { ...this.state, ...partial };
      this.update();
      return this;
   }

   /** Trigger custom updater */
   update() {
      this.updater?.();
      this.children.forEach((c) => c.update());
      return this;
   }

   setText(text: string) {
      this.el.innerText = text;
      return this;
   }

   /** Set/get innerHTML */
   html(content?: string) {
      if (content !== undefined) {
         this.el.innerHTML = content;
         return this;
      }
      return this.el.innerHTML;
   }

   /** Apply CSS styles */
   css(styles: Partial<CSSStyleDeclaration>) {
      Object.assign(this.el.style, styles);
      return this;
   }

   /** Add/remove/toggle class */
   class(name: string, state?: boolean) {
      if (state === undefined) {
         this.el.classList.toggle(name);
      } else if (state) {
         this.el.classList.add(name);
      } else {
         this.el.classList.remove(name);
      }
      return this;
   }

   /** Add event listener (auto cleaned on remove) */
   on<K extends keyof HTMLElementEventMap>(
      event: K,
      handler: UIEventHandler<K>,
   ) {
      const wrapped: EventListener = (e) => {
         handler({ e: e as HTMLElementEventMap[K], ui: this });
      };
      this.el.addEventListener(event, wrapped);
      this.listeners.push({ type: event, handler, wrapped });
      return this;
   }

   /** Append a child UI */
   append(child: UI) {
      this.el.append(child.el);
      this.children.push(child);
      return this;
   }

   /** Remove from DOM & cleanup */
   remove() {
      // remove children recursively
      this.children.forEach((c) => c.remove());
      this.children = [];

      // detach listeners
      this.listeners.forEach(({ type, wrapped }) => {
         this.el.removeEventListener(type, wrapped);
      });
      this.listeners = [];

      // remove from DOM
      this.el.remove();
      return this;
   }

   clear() {
      this.children.forEach((c) => c.remove());
      this.children = [];
      this.el.innerHTML = "";
      return this;
   }
}

export default UI;
