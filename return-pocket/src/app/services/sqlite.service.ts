import { Injectable } from '@angular/core';
import { SQLiteConnection, CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface Receipt {
  id?: number;
  store_name: string;
  location: string;
  points: number;
  total_amount: number;
  barcode_data?: string;
  timestamp?: string;
  synced?: number;
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

    try {
      this.db = await this.sqlite.retrieveConnection('receipt_db', false);
    } catch (e) {
      this.db = await this.sqlite.createConnection('receipt_db', false, 'no-encryption', 1, false);
    }

    await this.db.open();

    const schema = `
      CREATE TABLE IF NOT EXISTS receipts_table(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_name TEXT,
        location TEXT,
        points INTEGER,
        total_amount REAL,
        barcode_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
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
      INSERT INTO receipts_table (store_name, location, points, total_amount, barcode_data)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const values = [
      receipt.store_name,
      receipt.location,
      receipt.points,
      receipt.total_amount,
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

  async getBarcodeDataById(id: number): Promise<string | null> {
    const query = 'SELECT barcode_data FROM receipts_table WHERE id = ?';
    const result = await this.db?.query(query, [id]);

    return result?.values?.[0]?.barcode_data || null;
    
  }

  async getReceiptById(id: number): Promise<Receipt | null> {
    const result = await this.db?.query('SELECT * FROM receipts_table WHERE id = ?', [id]);
    return result?.values?.[0] || null;
  }
  
  
}
