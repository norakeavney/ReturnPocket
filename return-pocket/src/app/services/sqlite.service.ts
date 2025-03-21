import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface Receipt {
  id?: number;
  store_name: string;
  location: string;
  bottle_count: number;
  total_amount: number;
  img_path?: string;
  barcode_data?: string;
  timestamp?: string;
}


@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  
  private receipts: Receipt[] = [];
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;

  constructor() { }

  async initialise() {

    this.db = await this.sqlite.createConnection('receipt_db', false, 'no-encryption', 1, false);

    await this.db.open();

    const schema = `
      CREATE TABLE IF NOT EXISTS receipts_table(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_name TEXT,
        location TEXT,
        bottle_count INTEGER,
        total_amount REAL,
        img_path TEXT,
        barcode_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      `;
    await this.db.execute(schema);
    this.loadReceipts();

    return true;
  }

  async loadReceipts() {
    const receipts = await this.db?.query('SELECT * FROM receipts_table');
    this.receipts = receipts?.values || [];
  }

  async addReceipt(receipt: Receipt) {
    const query = `
      INSERT INTO receipts_table (store_name, location, bottle_count, total_amount, img_path, barcode_data)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const values = [
      receipt.store_name,
      receipt.location,
      receipt.bottle_count,
      receipt.total_amount,
      receipt.img_path,
      receipt.barcode_data
    ];

    try {
      await this.db?.run(query, values);
      await this.loadReceipts();
    } catch (error) {
      console.error('Error adding receipt:', error);
      throw error;
    }
  }

  async deleteReceipt(id: number) {
    const query = 'DELETE FROM receipts_table WHERE id = ?';
    try {
      await this.db?.run(query, [id]);
      await this.loadReceipts();
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }
  
  getReceipts() {
    return this.receipts;
  }
  
}
