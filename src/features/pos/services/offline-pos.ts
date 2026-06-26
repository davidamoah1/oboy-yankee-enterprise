import { openDB, IDBPDatabase } from 'idb';
import { Product } from '@/types/entities';

const DB_NAME = 'sme-os-pos';
const DB_VERSION = 2;

export interface OfflineTransaction {
  id: string;
  total_amount: number;
  payment_method: string;
  items: any[];
  created_at: string;
  synced: boolean;
}

export interface OfflineAttendanceLog {
  id: string;
  staff_id: string;
  staff_name: string;
  action: 'clock_in' | 'clock_out';
  timestamp: string;
  synced: boolean;
  notes?: string;
}

class OfflinePOSService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Products cache
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        // Pending transactions
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }
        // System state (last sync, tenant info)
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
        // Attendance log buffer
        if (!db.objectStoreNames.contains('attendance_logs')) {
          db.createObjectStore('attendance_logs', { keyPath: 'id' });
        }
      },
    });
  }

  // --- Product Sync ---
  async saveProducts(products: Product[]) {
    const db = await this.db;
    const tx = db.transaction('products', 'readwrite');
    await tx.objectStore('products').clear();
    for (const product of products) {
      await tx.objectStore('products').put(product);
    }
    await tx.done;
  }

  async getProducts() {
    const db = await this.db;
    return db.getAll('products');
  }

  // --- Transaction Queue ---
  async queueTransaction(transaction: Omit<OfflineTransaction, 'synced' | 'id'>) {
    const db = await this.db;
    const id = crypto.randomUUID();
    const offlineTx: OfflineTransaction = {
      ...transaction,
      id,
      synced: false,
    };
    await db.put('transactions', offlineTx);
    return offlineTx;
  }

  async getPendingTransactions() {
    const db = await this.db;
    const all = await db.getAll('transactions');
    return all.filter(tx => !tx.synced);
  }

  async markAsSynced(id: string) {
    const db = await this.db;
    const tx = await db.get('transactions', id);
    if (tx) {
      tx.synced = true;
      await db.put('transactions', tx);
    }
  }

  async removeSyncedTransactions() {
    const db = await this.db;
    const all = await db.getAll('transactions');
    const tx = db.transaction('transactions', 'readwrite');
    for (const item of all) {
      if (item.synced) {
        await tx.objectStore('transactions').delete(item.id);
      }
    }
    await tx.done;
  }

  // --- Attendance Logs Queue ---
  async queueAttendanceLog(log: Omit<OfflineAttendanceLog, 'synced' | 'id'>) {
    const db = await this.db;
    const id = crypto.randomUUID();
    const offlineLog: OfflineAttendanceLog = {
      ...log,
      id,
      synced: false,
    };
    await db.put('attendance_logs', offlineLog);
    return offlineLog;
  }

  async getPendingAttendanceLogs() {
    const db = await this.db;
    const all = await db.getAll('attendance_logs');
    return all.filter(l => !l.synced);
  }

  async getAllAttendanceLogs() {
    const db = await this.db;
    return db.getAll('attendance_logs');
  }

  async markAttendanceLogSynced(id: string) {
    const db = await this.db;
    const log = await db.get('attendance_logs', id);
    if (log) {
      log.synced = true;
      await db.put('attendance_logs', log);
    }
  }

  async deleteSyncedAttendanceLogs() {
    const db = await this.db;
    const all = await db.getAll('attendance_logs');
    const tx = db.transaction('attendance_logs', 'readwrite');
    for (const item of all) {
      if (item.synced) {
        await tx.objectStore('attendance_logs').delete(item.id);
      }
    }
    await tx.done;
  }
}

export const offlinePOS = new OfflinePOSService();
