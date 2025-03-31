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
  filteredReceipts = [...this.receipts];

  sortBy: string = 'dateDesc';
  filterStore: string = '';
  uniqueStores: string[] = [];

  constructor(private sqliteService: SqliteService, private router: Router) {
    this.uniqueStores = [...new Set(this.receipts.map(r => r.store_name))];
    this.applyFilters();
  }

  applyFilters() {
    let data = [...this.receipts];

    if (this.filterStore) {
      data = data.filter(r => r.store_name === this.filterStore);
    }

    switch (this.sortBy) {
      case 'dateAsc':
        data.sort((a, b) => (a.timestamp ?? '').localeCompare(b.timestamp ?? ''));
        break;
      case 'dateDesc':
        data.sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''));
        break;
      case 'amountAsc':
        data.sort((a, b) => a.total_amount - b.total_amount);
        break;
      case 'amountDesc':
        data.sort((a, b) => b.total_amount - a.total_amount);
        break;
    }

    this.filteredReceipts = data;
  }

  viewReceipt(id: string | undefined) {
    if (!id) return;
    this.router.navigate(['/receipt-detail', id]);
  }

  setSortBy(sort: string) {
    this.sortBy = sort;
    this.applyFilters();
  }

  setFilterStore(store: string) {
    this.filterStore = store;
    this.applyFilters();
  }
}



