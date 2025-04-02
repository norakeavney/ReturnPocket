import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receipt-card',
  templateUrl: './receipt-card.component.html',
  styleUrls: ['./receipt-card.component.scss'],
  imports: [CommonModule] 
})
export class ReceiptCardComponent  {

  @Input() receipt: any;

  constructor(private router: Router) {}

  viewReceipt(id: string | number) {
    this.router.navigate(['/receipt-detail', id]);
  }


  getStoreLogo(store: string): string {
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
