import localforage from 'localforage';
import { type Review } from './types';

export class AppDB {
  storage;
  ready!: Promise<void>;

  acceptedCount = 0;
  refusedCount = 0;
  weekAcceptedCount = 0;
  weekRefusedCount = 0;
  history: Review[] = [];

  private weekStart = new Date();
  private weekEnd = new Date();
  private async refreshTime() {
    const date = new Date();
    const weekDay = date.getDay();
    date.setDate(date.getDate() - (weekDay === 0 ? 6 : weekDay - 1));
    date.setHours(0, 0, 0, 0);
    this.weekStart = date;
    date.setDate(date.getDate() + 7);
    this.weekEnd = date;

    this.weekAcceptedCount = this.weekRefusedCount = 0;
    for (let i = this.history.length - 1; i >= 0; --i) {
      const current = this.history[i];
      if (new Date(current.time) < this.weekStart) break;
      if (current.accepted) {
        ++this.weekAcceptedCount;
      } else {
        ++this.weekRefusedCount;
      }
    }
  }

  private async initialize() {
    await this.storage.ready();
    this.history = (await this.storage.getItem('history')) ?? [];

    for (const current of this.history) {
      if (current.accepted) {
        ++this.acceptedCount;
      } else {
        ++this.refusedCount;
      }
    }

    await this.refreshTime();
  }

  reconstruct() {
    this.ready = this.initialize();
  }
  constructor(name: string) {
    this.storage = localforage.createInstance({ name });
    this.reconstruct();
  }

  async put(value: Review) {
    await this.ready;

    if (value.accepted) {
      ++this.acceptedCount;
      ++this.weekAcceptedCount;
    } else {
      ++this.refusedCount;
      ++this.weekRefusedCount;
    }
    this.history.push(value);

    if (new Date() >= this.weekEnd) await this.refreshTime();

    await this.storage.setItem('history', this.history);
  }
}

export const db = new AppDB('problem-admin-history');
