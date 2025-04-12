import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Receipt } from '../../services/sqlite.service';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../../services/reminder.service';

/**
 * Confirmation Modal Component for Receipt Processing
 * 
 * Provides a user interface for verifying and potentially modifying details 
 * of a scanned receipt before final confirmation. Allows users to:
 * - Edit store information
 * - Modify receipt amount
 * - Set reminders for scanning at checkout
 */
@Component({
  selector: 'app-confirmreceiptmodal',
  templateUrl: './confirmreceiptmodal.component.html',
  styleUrls: ['./confirmreceiptmodal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeIn', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
    trigger('slideIn', [
      state('void', style({
        transform: 'translateY(20px)',
        opacity: 0
      })),
      transition('void => *', animate('300ms ease-out')),
    ])
  ]
})
export class ConfirmreceiptmodalComponent implements OnInit {
  /** The receipt data to be confirmed */
  @Input() receipt!: Receipt;
  
  /** Event emitted when receipt is confirmed with potentially modified data */
  @Output() confirmed = new EventEmitter<Receipt>();
  
  /** Event emitted when confirmation is canceled */
  @Output() canceled = new EventEmitter<void>();
  
  /** Controls animation state of the component */
  animationState = 'in';
  
  /** Controls visibility of store selection overlay */
  showStoreSelection = false;
  
  /** Flag indicating if amount is being edited */
  editingAmount = false;
  
  /** Flag indicating if the amount has been manually edited */
  isAmountEdited = false;
  
  /** Temporary storage for amount while editing */
  tempAmount: number = 0;
  
  /** Flag controlling whether reminder functionality is enabled */
  reminderEnabled = false;
  
  /** Currently selected reminder time in minutes, null if none selected */
  selectedReminderTime: number | null = null;
  
  /** Available reminder time options */
  reminderTimes = [
    { value: 1, label: '1 min' },
    { value: 5, label: '5 mins' },
    { value: 10, label: '10 mins' },
    { value: 30, label: '30 mins' }
  ];
  
  /** Available store options with their logo references */
  storeOptions = [
    { name: 'Tesco', logo: 'tesco.png' },
    { name: 'Dunnes', logo: 'dunnes.png' },
    { name: 'Lidl', logo: 'lidl.png' },
    { name: 'Aldi', logo: 'aldi.png' },
    { name: 'SuperValu', logo: 'supervalu.png' },
    { name: 'Centra', logo: 'centra.png' },
    { name: 'Spar', logo: 'spar.png' },
    { name: 'Other', logo: 'other.png' }
  ];

  /**
   * @param modalController - Service to control the modal instance
   * @param reminderService - Service to handle scheduling reminders
   */
  constructor(
    private modalController: ModalController,
    private reminderService: ReminderService
  ) { }

  /**
   * Initializes component state on creation
   * Stores initial receipt amount for reference
   */
  ngOnInit() {
    this.tempAmount = this.receipt.total_amount;
  }
  
  /**
   * Gets the appropriate store logo based on receipt's store name
   * @returns URL path to the store logo image
   */
  getStoreLogo(): string {
    const store = this.storeOptions.find(s => 
      s.name.toLowerCase() === this.receipt?.store_name?.toLowerCase()
    );
    return store ? `/assets/resources/store-logos/${store.logo}` : '/assets/resources/store-logos/other.png';
  }
  
  /**
   * Shows the store selection overlay
   */
  changeStore() {
    this.showStoreSelection = true;
  }
  
  /**
   * Updates receipt with selected store and hides selection overlay
   * @param storeName - Name of the selected store
   */
  selectStore(storeName: string) {
    this.receipt.store_name = storeName;
    this.showStoreSelection = false;
  }
  
  /**
   * Initiates the amount editing process
   * Copies current amount to temporary variable for editing
   */
  startEditingAmount() {
    this.editingAmount = true;
    this.tempAmount = this.receipt.total_amount;
  }
  
  /**
   * Applies edited amount to receipt if changed
   * Resets points to zero if amount was modified
   */
  saveAmount() {
    if (this.tempAmount !== this.receipt.total_amount) {
      this.receipt.total_amount = this.tempAmount;
      this.isAmountEdited = true;
      this.receipt.points = 0;
    }
    this.editingAmount = false;
  }
  
  /**
   * Cancels amount editing without saving changes
   */
  cancelEditingAmount() {
    this.editingAmount = false;
    this.tempAmount = this.receipt.total_amount;
  }
  
  /**
   * Calculates points based on receipt amount
   * @param amount - The monetary amount to calculate points for
   * @returns The calculated points value as an integer
   */
  calculatePoints(amount: number): number {
    return Math.round(amount * 100);
  }
  
  /**
   * Schedules a reminder notification based on user preferences
   * 
   * Creates a notification to remind the user to scan their receipt
   * at checkout after the specified time interval.
   * 
   * @returns Promise that resolves when the reminder has been scheduled
   */
  async scheduleReminder() {
    if (!this.reminderEnabled || this.selectedReminderTime === null) {
      return;
    }
    
    try {
      const storeName = this.receipt.store_name || 'Unknown Store';
      const amount = this.receipt.total_amount.toFixed(2);
      const message = `Don't forget to scan your ${storeName} receipt for €${amount} at the till!`;
      
      console.log(`Scheduling reminder for ${storeName} in ${this.selectedReminderTime} minutes`);
      
      const notificationId = await this.reminderService.scheduleReminder(
        message, 
        this.selectedReminderTime
      );
      
      console.log('Reminder scheduled with ID:', notificationId);
      
      // Show success feedback to user via toast notification
      const toast = document.createElement('ion-toast');
      toast.message = `Reminder set for ${this.selectedReminderTime} minutes from now`;
      toast.duration = 2000;
      toast.position = 'bottom';
      toast.color = 'success';
      document.body.appendChild(toast);
      await toast.present();
      
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      
      // Show error feedback to user via toast notification
      const toast = document.createElement('ion-toast');
      toast.message = 'Failed to set reminder';
      toast.duration = 2000;
      toast.position = 'bottom';
      toast.color = 'danger';
      document.body.appendChild(toast);
      await toast.present();
    }
  }
  
  /**
   * Sets the time interval for the reminder
   * @param minutes - Time in minutes before the reminder should trigger
   */
  setReminderTime(minutes: number) {
    this.selectedReminderTime = minutes;
    console.log('Reminder time set to', minutes, 'minutes');
  }
  
  /**
   * Toggles the reminder feature on/off
   * 
   * When enabled and no time is selected, defaults to the first available option.
   * 
   * @param enabled - Whether reminders should be enabled
   */
  setReminderEnabled(enabled: boolean) {
    this.reminderEnabled = enabled;
    console.log('Reminder enabled:', enabled);
    
    // When enabling, select the first option by default if nothing is selected
    if (enabled && this.selectedReminderTime === null) {
      this.selectedReminderTime = this.reminderTimes[0].value;
    }
  }

  /**
   * Confirms the receipt and finalizes the process
   * 
   * Schedules any requested reminders, emits the confirmation event,
   * and closes the modal with the potentially modified receipt data.
   */
  async confirmReceipt() {
    if (this.reminderEnabled && this.selectedReminderTime !== null) {
      await this.scheduleReminder();
    }
    
    this.confirmed.emit(this.receipt);
    this.modalController.dismiss(this.receipt);
  }
  
  /**
   * Cancels the confirmation process
   * 
   * Emits the cancellation event and closes the modal without changes.
   */
  cancelConfirmation() {
    this.canceled.emit();
    this.modalController.dismiss();
  }
}
