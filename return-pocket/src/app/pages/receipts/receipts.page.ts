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

  receipts = this.sqliteService.getReceipts();

  constructor(private sqliteService: SqliteService) {
    
  }

  async ngOnInit() {
  }
  

}


