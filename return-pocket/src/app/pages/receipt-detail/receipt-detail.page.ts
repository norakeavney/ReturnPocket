import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SqliteService, Receipt } from 'src/app/services/sqlite.service';
import {
  trigger, transition, style, animate
} from '@angular/animations';

@Component({
  standalone: false,
  selector: 'app-receipt-detail',
  templateUrl: './receipt-detail.page.html',
  styleUrls: ['./receipt-detail.page.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(100px)' }))
      ])
    ])
  ]
  
})
export class ReceiptDetailPage implements OnInit {
  currentId: string = '';
  receipt: Receipt | null = null;
  reminderDate: string = '';
  reminderModalOpen: boolean = false;
  reminderSet: boolean = false;
  error: string | null = null;
  storeLogoPath: string = 'assets/resources/other.png'; 
  minDateTime = new Date().toISOString();

  constructor(
    private route: ActivatedRoute,
    private sqliteService: SqliteService,
  ) {}

  /**
   * Initializes the component by fetching the receipt data based on the current route ID.
   */
  async ngOnInit() {
    this.currentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.currentId) {
      try {
        const id = parseInt(this.currentId);
        this.receipt = await this.sqliteService.getReceiptById(id);
        this.storeLogoPath = this.receipt ? this.getLogoPath(this.receipt.store_name) : 'assets/resources/other.png';
      } catch (err) {
        this.error = 'Failed to load receipt data';
        console.error(err);
      }
    }
  }

  /**
   * Handles the event when a reminder is set.
   * Closes the reminder modal and marks the reminder as set.
   */
  onReminderSet() {
    this.reminderSet = true;
    this.reminderModalOpen = false;
  }

  /**
   * Fallback handler for when the store logo image fails to load.
   * Sets the store logo path to a default image.
   */
  onLogoError() {
    this.storeLogoPath = 'assets/resources/other.png';
  }

  /**
   * Retrieves the logo path for a given store name.
   * @param store - The name of the store.
   * @returns The path to the store's logo image.
   */
  getLogoPath(store: string): string {
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
