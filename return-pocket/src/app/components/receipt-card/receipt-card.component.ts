import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receipt-card',
  templateUrl: './receipt-card.component.html',
  styleUrls: ['./receipt-card.component.scss'],
  imports: [CommonModule] 
})
export class ReceiptCardComponent  {

  @Input() storeName: string | null = null;;
  @Input() storeLogo: string | null = null;;
  @Input() location: string | null = null;;
  @Input() bottleCount: number | null = null;;
  @Input() totalAmount: number | null = null;;
  @Input() imagePath: string | undefined;
  //@Input() barcode: string | null = null;;

  constructor() { }

}
