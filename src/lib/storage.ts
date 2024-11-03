import { openDB, type IDBPDatabase } from 'idb';

export class DB {
  private dbPromise;

  constructor(name: string, version?: number) {
    this.dbPromise = openDB(name, version);
  }
  async get(key: string) {
    return (await this.dbPromise).get('keyvaluepairs', key);
  }
  async set(key: string, val: unknown) {
    return (await this.dbPromise).put('keyvaluepairs', val, key);
  }
  async del(key: string) {
    return (await this.dbPromise).delete('keyvaluepairs', key);
  }
}
