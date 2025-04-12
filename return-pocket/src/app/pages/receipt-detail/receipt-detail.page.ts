import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SqliteService, Receipt } from 'src/app/services/sqlite.service';
import { ToastController } from '@ionic/angular';
import {
  trigger, transition, style, animate
} from '@angular/animations';

/**
 * Responsible for displaying detailed information about a receipt
 * including store info, total amount, points, and barcode.
 * Provides options to set reminders, mark receipts as used, and delete receipts.
 */
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
  /** ID of the current receipt being viewed */
  currentId: string = '';
  
  /** Receipt data containing store, amount, and other details */
  receipt: Receipt | null = null;
  
  /** ISO date string for reminder scheduling */
  reminderDate: string = '';
  
  /** Controls visibility of the reminder modal */
  reminderModalOpen: boolean = false;
  
  /** Tracks if a reminder has been set for this receipt */
  reminderSet: boolean = false;
  
  /** Controls visibility of the delete confirmation modal */
  deleteModalOpen: boolean = false;
  
  /** Controls visibility of the mark-as-used confirmation modal */
  markAsUsedModalOpen: boolean = false;
  
  /** Error message to display if data loading fails */
  error: string | null = null;
  
  /** Path to the store logo image */
  storeLogoPath: string = 'assets/resources/other.png'; 
  
  /** Minimum date/time that can be selected for reminders (current time) */
  minDateTime = new Date().toISOString();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sqliteService: SqliteService,
    private toastController: ToastController
  ) {}

  /**
   * Navigates back to the receipts list page
   */
  goBack() {
    this.router.navigate(['/receipts']);
  }

  /**
   * Initializes the component by fetching receipt data based on route parameters.
   * Sets the appropriate store logo based on the receipt's store name.
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
   * Handles the event when a reminder is successfully set.
   * Updates UI state and closes the reminder modal.
   */
  onReminderSet() {
    this.reminderSet = true;
    this.reminderModalOpen = false;
  }

  /**
   * Fallback handler when the store logo fails to load.
   * Sets the logo to a default image.
   */
  onLogoError() {
    this.storeLogoPath = 'assets/resources/other.png';
  }

  /**
   * Maps store names to their respective logo image paths.
   * 
   * @param store - The name of the store to find a logo for
   * @returns Path to the store's logo image or a default if not found
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

  /**
   * Opens the confirmation modal for marking a receipt as used
   */
  confirmMarkAsUsed() {
    this.markAsUsedModalOpen = true;
  }

  /**
   * Updates the receipt's barcode data to indicate it has been used.
   * Shows a success toast upon completion and navigates back to home.
   */
  async markAsUsed() {
    if (this.receipt) {
      try {
        await this.sqliteService.updateBarcodeData(+this.currentId, "ALREADY USED");
        this.markAsUsedModalOpen = false;
        
        const toast = await this.toastController.create({
          message: 'Receipt marked as used',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
        
        this.router.navigate(['/home']);
      } catch (err) {
        console.error('Error marking receipt as used:', err);
        this.showErrorToast('Failed to update receipt');
      }
    }
  }

  /**
   * Opens the confirmation modal for deleting a receipt
   */
  confirmDelete() {
    this.deleteModalOpen = true;
  }

  /**
   * Permanently deletes the current receipt from the database.
   * Shows a success toast upon completion and navigates back to home.
   */
  async deleteReceipt() {
    if (this.receipt) {
      try {
        await this.sqliteService.deleteReceipt(+this.currentId);
        this.deleteModalOpen = false;
        const toast = await this.toastController.create({
          message: 'Receipt deleted successfully',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
        this.router.navigate(['/home']);
      } catch (err) {
        console.error('Error deleting receipt:', err);
        this.showErrorToast('Failed to delete receipt');
      }
    }
  }

  /**
   * Displays an error toast with the provided message.
   * 
   * @param message - The error message to display
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
}
