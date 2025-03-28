import { Component } from '@angular/core';
import { SqliteService } from '../../services/sqlite.service';
import { Router } from '@angular/router';


@Component({
  standalone: false,
  selector: 'app-receipts',
  templateUrl: './receipts.page.html',
  styleUrls: ['./receipts.page.scss'],
})
export class ReceiptsPage {

  receipts = this.sqliteService.getReceipts();

  constructor(private sqliteService: SqliteService, private router: Router) {
    
  }

  viewReceipt(id: string | undefined) {
    if (!id) return; // don't navigate if id is missing
    this.router.navigate(['/receipt-detail', id]);
  }
  
  

}


