import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Receipt Card Component
 * 
 * Displays a formatted receipt summary card with store information,
 * receipt details, and navigation to the detailed view.
 * The component displays different UI states based on whether 
 * the receipt barcode has been used.
 */
@Component({
  selector: 'app-receipt-card',
  templateUrl: './receipt-card.component.html',
  styleUrls: ['./receipt-card.component.scss'],
  imports: [CommonModule] 
})
export class ReceiptCardComponent  {

  /**
   * Receipt data object containing details like
   * store_name, location, points, total_amount, barcode_data, etc.
   */
  @Input() receipt: any;

  constructor(private router: Router) {}

  /**
   * Navigates to the receipt detail page for the specified receipt.
   * 
   * @param id - The unique identifier of the receipt to view
   */
  viewReceipt(id: string | number) {
    this.router.navigate(['/receipt-detail', id]);
  }

  /**
   * Determines the appropriate logo path based on the store name.
   * Falls back to a default logo if the store is unknown or null.
   * 
   * @param store - The name of the store that issued the receipt
   * @returns Path to the store's logo image
   */
  getStoreLogo(store: string): string {
    if (!store) return 'assets/resources/store-logos/other.png';
    
    switch (store.toLowerCase()) {
      case 'tesco': return 'assets/resources/store-logos/tesco.png';
      case 'lidl': return 'assets/resources/store-logos/lidl.png';
      case 'aldi': return 'assets/resources/store-logos/aldi.png';
      case 'centra': return 'assets/resources/store-logos/centra.png';
      case 'spar': return 'assets/resources/store-logos/spar.png';
      case 'dunnes' : return 'assets/resources/store-logos/dunnes.png';
      case 'supervalu': return 'assets/resources/store-logos/supervalu.png';
      default: return 'assets/resources/store-logos/other.png';
    }
  }
  
}
