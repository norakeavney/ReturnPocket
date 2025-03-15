import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { c } from '@angular/core/navigation_types.d-u4EOrrdZ';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private sqlite: SQLiteConnection;

  constructor() { 
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initDB() {

    try {
      const platform = Capacitor.getPlatform();

      const db = await this.sqlite.createConnection(
        'receipt_db',
        false, 
        platform === 'ios' || platform === 'android' ? 'native' : 'no-encryption',
        1,  // version number
        false  // mode (false for read-write mode)
      );

      await db.open();
      console.log('DB Opened Successfully');

      await this.createTables(db);
      await this.testData(db);

    } catch (error) {
      console.error('initDB', error);
    }

  }

  async createTables(db: SQLiteDBConnection) {

    const query = `
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

    try {
      await db.execute(query);
      console.log('Table Created Successfully');
    } catch (error) {
      console.error('createTables', error);
    }
  }

  async testData(db: SQLiteDBConnection) {

    try {

      const checkQuery = 'SELECT COUNT(*) AS count FROM receipts_table';
      const result = await db.query(checkQuery);

      if (result.values && result.values[0].count === 0) {
        console.log('testData', 'No test data found, populating...');

        const insertQuery = `
          INSERT INTO receipts_table (store_name, location, bottle_count, total_amount, img_path, barcode_data)
          VALUES
          ('Tesco', 'Headford Road, Galway', 15, 2.25, '/path/to/img.jpg', '1234567890'),
          ('Aldi', 'Ballybrit, Galway', 10, 1.50, '/path/to/img.jpg', '0987654321'),
          ('Lidl', 'Westside, Galway', 20, 3.00, '/path/to/img.jpg', '5432167890');
        `;

        await db.execute(insertQuery);
        console.log('testData', 'Data inserted successfully');

      } else {
        console.log('testData', 'Data already exists');
      }

    } catch (error) {
      console.error('testData', error);
    }
  }
}
