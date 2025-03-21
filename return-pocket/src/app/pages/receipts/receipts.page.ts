import { Component, OnInit } from '@angular/core';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  standalone: false,
  selector: 'app-receipts',
  templateUrl: './receipts.page.html',
  styleUrls: ['./receipts.page.scss'],
  providers: [SqliteService]
})
export class ReceiptsPage implements OnInit {

  receipts: any[] = [];

  constructor() {}

  async ngOnInit() {
  }
  

  async loadReceipts() {
    try {
      console.log("🔍 Loading receipts...");
      //this.receipts = await SqliteService.getReceipts();
      console.log("📦 Loaded Receipts:", this.receipts);
    } catch (error) {
      console.error("❌ Error loading receipts:", error);
    }
  }
}

