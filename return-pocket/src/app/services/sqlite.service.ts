import { Injectable } from '@angular/core';
import { SQLiteConnection, CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

/**
 * Interface representing a receipt.
 */
export interface Receipt {
<<<<<<< HEAD
  id?: number; // Unique identifier for the receipt
  store_name: string; // Name of the store
  location: string; // Location of the store
  bottle_count: number; // Number of bottles in the receipt
  total_amount: number; // Total amount for the receipt
  img_path?: string; // Optional image path for the receipt
  barcode_data?: string; // Optional barcode data associated with the receipt
  timestamp?: string; // Timestamp when the receipt was created
=======
  id?: number;
  store_name: string;
  location: string;
  points: number;
  total_amount: number;
  barcode_data?: string;
  timestamp?: string;
  synced?: number;
>>>>>>> 878492917475ff0fbd33f2ff299c9b3b21f331a9
}

@Injectable({
  providedIn: 'root'
})
/**
 * Service for managing SQLite database operations related to receipts.
 */
export class SqliteService {

  private receipts: Receipt[] = []; // Local cache of receipts
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite); // SQLite connection instance
  private db: SQLiteDBConnection | null = null; // SQLite database connection

  constructor() { }

  /**
   * Initializes the SQLite database connection and creates the receipts table if it doesn't exist.
   * @returns A promise that resolves to true when initialization is complete.
   */
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

  /**
   * Loads all receipts from the database into the local cache.
   */
  async loadReceipts() {
    const receipts = await this.db?.query('SELECT * FROM receipts_table');
    this.receipts = receipts?.values || [];
  }

  /**
   * Adds a new receipt to the database and updates the local cache.
   * @param receipt The receipt object to be added.
   * @throws Error if the operation fails.
   */
  async addReceipt(receipt: Receipt) {
    const query = `
      INSERT INTO receipts_table (store_name, location, points, total_amount, barcode_data)
      VALUES (?, ?, ?, ?, ?);
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

  /**
   * Deletes a receipt from the database by its ID and updates the local cache.
   * @param id The ID of the receipt to delete.
   * @throws Error if the operation fails.
   */
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
  
  /**
   * Retrieves all receipts from the local cache.
   * @returns An array of receipts.
   */
  getReceipts() {
    return this.receipts;
  }

  /**
   * Retrieves the barcode data of a receipt by its ID.
   * @param id The ID of the receipt.
   * @returns A promise that resolves to the barcode data or null if not found.
   */
  async getBarcodeDataById(id: number): Promise<string | null> {
    const query = 'SELECT barcode_data FROM receipts_table WHERE id = ?';
    const result = await this.db?.query(query, [id]);

    return result?.values?.[0]?.barcode_data || null;
    
  }

  /**
   * Retrieves a receipt by its ID.
   * @param id The ID of the receipt.
   * @returns A promise that resolves to the receipt object or null if not found.
   */
  async getReceiptById(id: number): Promise<Receipt | null> {
    const result = await this.db?.query('SELECT * FROM receipts_table WHERE id = ?', [id]);
    return result?.values?.[0] || null;
  }

  async getUnsyncedPointsTotal(): Promise<number> {
    const res = await this.db?.query("SELECT SUM(points) as total FROM receipts_table WHERE synced = 0");
    return res?.values?.[0]?.total || 0;
  }

  async getUnsyncedReceiptIds(): Promise<number[]> {
    const res = await this.db?.query("SELECT id FROM receipts_table WHERE synced = 0");
    return res?.values?.map(r => r.id) || [];
  }  

  async markDataSynced(ids: number[]): Promise<void> {
    if (!ids.length) return;

    const placeholders = ids.map(() => '?').join(',');
    const query = `UPDATE receipts_table SET synced = 1 WHERE id IN (${placeholders})`;
    await this.db?.run(query, ids);
  }

  async getUnsyncedStoreBreakdown(): Promise<Record<string, number>> {
    const res = await this.db?.query(`
      SELECT store_name, SUM(points) as total 
      FROM receipts_table 
      WHERE synced = 0 
      GROUP BY store_name
    `);
  
    const result: Record<string, number> = {};
    res?.values?.forEach((row: any) => {
      result[row.store_name] = row.total;
    });
  
    return result;
  }
  
  
  
}
