import { Component } from '@angular/core';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  standalone: false,
  selector: 'app-receipts',
  templateUrl: './receipts.page.html',
  styleUrls: ['./receipts.page.scss'],
})
export class ReceiptsPage {

  receipts = this.sqliteService.getReceipts();

  constructor(private sqliteService: SqliteService) {
    
  }

}


