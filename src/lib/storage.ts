import { openDB } from 'idb';

const store = 'keyvaluepairs';

export class DB {
  private dbPromise;

  constructor(name: string, version?: number) {
    this.dbPromise = openDB(name, version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store);
        }
      },
    });
  }
  async get(key: string) {
    if (!(await this.dbPromise).objectStoreNames.contains(store)) return undefined;
    return (await this.dbPromise).get(store, key);
  }
  async set(key: string, val: unknown) {
    return (await this.dbPromise).put(store, val, key);
  }
  async clear() {
    (await this.dbPromise).clear(store);
  }
}
