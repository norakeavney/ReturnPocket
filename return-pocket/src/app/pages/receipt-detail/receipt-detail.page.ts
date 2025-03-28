import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Receipt, SqliteService } from '../../services/sqlite.service';

@Component({
  standalone: false,
  selector: 'app-receipt-detail',
  templateUrl: './receipt-detail.page.html',
  styleUrls: ['./receipt-detail.page.scss'],
})
export class ReceiptDetailPage implements OnInit {
  currentId: string = '';
  receipt: Receipt | null = null;
  barcodeData: string | null = null;
  error: string | null = null;

  

  constructor(
    private route: ActivatedRoute,
    private sqliteService: SqliteService
  ) {}

  async ngOnInit() {
    this.currentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.currentId) {
      try {
        const id = parseInt(this.currentId);
        this.barcodeData = await this.sqliteService.getBarcodeDataById(id);
        this.receipt = await this.sqliteService.getReceiptById(id);
      } catch (err) {
        this.error = 'Failed to load receipt data';
        console.error(err);
      }
    }
  }
}
