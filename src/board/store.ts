interface StoreInterface {
   ID: () => string;
}

class Store<T extends StoreInterface> {
   private lastInserted: T | null;
   declare store: Map<string, T>;
   constructor() {
      this.store = new Map();
      this.lastInserted = null;
   }

   private set lastInsert(v: T) {
      this.lastInserted = v;
   }

   deleteById(id: string): boolean {
      // find
      const e = this.store.get(id);
      if (e) {
         this.store.delete(id);
         return true;
      }
      return false;
   }

   get getLastInserted(): T | null {
      return this.lastInserted;
   }

   getById(id: string) {
      return this.store.get(id);
   }

   insert(values: T[], callback: (v: T) => void) {
      values.forEach((v) => {
         this.store.set(v.ID(), v);
         callback(v);
         this.lastInsert = v;
      });
   }

   forEach(callback: (v: T) => void | boolean): T | null {
      for (const [_, value] of this.store) {
         if (callback(value)) {
            return value;
         }
      }
      return null;
   }
}

export default Store;
