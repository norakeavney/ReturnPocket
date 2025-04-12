import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SqliteService } from 'src/app/services/sqlite.service';
import { Router } from '@angular/router';

/**
 * Manages the display and interaction with receipt items.
 * Provides functionality for sorting, filtering, and navigating receipts.
 */
@Component({
  standalone: false,
  selector: 'app-receipts',
  templateUrl: './receipts.page.html',
  styleUrls: ['./receipts.page.scss'],
})
export class ReceiptsPage {
  /** Collection of all receipts from the database */
  receipts = this.sqliteService.getReceipts();
  
  /** Current filtered and sorted view of receipts */
  filteredReceipts = [...this.receipts];

  /** Current sort criterion (dateDesc, dateAsc, amountDesc, amountAsc) */
  sortBy: string = 'dateDesc';
  
  /** Current store filter (empty string means no filter) */
  filterStore: string = '';
  
  /** List of distinct store names from all receipts */
  uniqueStores: string[] = [];

  /**
   * Initializes the component, populates the unique stores list,
   * and applies initial filters.
   * 
   * @param sqliteService - Service for database operations
   * @param router - Angular router for navigation
   * @param navCtrl - Ionic navigation controller
   */
  constructor(private sqliteService: SqliteService, private router: Router, private navCtrl: NavController) {
    this.uniqueStores = [...new Set(this.receipts.map(r => r.store_name))];
    this.applyFilters();
  }

  /**
   * Applies current filters and sorting to the receipts list.
   * Modifies the filteredReceipts array based on current filterStore and sortBy values.
   */
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

  /**
   * Navigates to the receipt detail page for the specified receipt.
   * 
   * @param id - The unique identifier of the receipt to view
   */
  viewReceipt(id: string | undefined) {
    if (!id) return;
    this.router.navigate(['/receipt-detail', id]);
  }

  /**
   * Updates the sorting criterion and refreshes the receipt list.
   * 
   * @param sort - The sorting method to apply ('dateAsc', 'dateDesc', 'amountAsc', 'amountDesc')
   */
  setSortBy(sort: string) {
    this.sortBy = sort;
    this.applyFilters();
  }

  /**
   * Updates the store filter and refreshes the receipt list.
   * 
   * @param store - The name of the store to filter by (empty string shows all stores)
   */
  setFilterStore(store: string) {
    this.filterStore = store;
    this.applyFilters();
  }

  /**
   * Navigates back to the previous page.
   */
  goBack() {
    this.navCtrl.navigateBack('/');
  }
}