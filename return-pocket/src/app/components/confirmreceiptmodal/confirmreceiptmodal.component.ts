import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Receipt } from '../../services/sqlite.service';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../../services/reminder.service';

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
  @Input() receipt!: Receipt;
  @Output() confirmed = new EventEmitter<Receipt>();
  @Output() canceled = new EventEmitter<void>();
  
  animationState = 'in';
  showStoreSelection = false;
  editingAmount = false;
  isAmountEdited = false;
  tempAmount: number = 0;
  
  // Reminder related properties
  reminderEnabled = false;
  selectedReminderTime: number | null = null;
  reminderTimes = [
    { value: 1, label: '1 min' },
    { value: 5, label: '5 mins' },
    { value: 10, label: '10 mins' },
    { value: 30, label: '30 mins' }
  ];
  
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

  constructor(
    private modalController: ModalController,
    private reminderService: ReminderService
  ) { }

  ngOnInit() {
    // Store original amount for reference
    this.tempAmount = this.receipt.total_amount;
  }
  
  getStoreLogo(): string {
    const store = this.storeOptions.find(s => 
      s.name.toLowerCase() === this.receipt?.store_name?.toLowerCase()
    );
    return store ? `/assets/resources/store-logos/${store.logo}` : '/assets/resources/store-logos/other.png';
  }
  
  changeStore() {
    this.showStoreSelection = true;
  }
  
  selectStore(storeName: string) {
    this.receipt.store_name = storeName;
    this.showStoreSelection = false;
  }
  
  startEditingAmount() {
    this.editingAmount = true;
    this.tempAmount = this.receipt.total_amount;
  }
  
  saveAmount() {
    // Check if amount has actually changed
    if (this.tempAmount !== this.receipt.total_amount) {
      this.receipt.total_amount = this.tempAmount;
      this.isAmountEdited = true;
      // Reset points to 0 if user manually edits amount
      this.receipt.points = 0;
    }
    this.editingAmount = false;
  }
  
  cancelEditingAmount() {
    this.editingAmount = false;
    this.tempAmount = this.receipt.total_amount;
  }
  
  // Update points calculation when store changes
  // Keep the points calculation method for any internal calculations
  calculatePoints(amount: number): number {
    return Math.round(amount * 100);
  }
  
  /**
   * Schedule a reminder notification
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
      
      // Show feedback to user
      const toast = document.createElement('ion-toast');
      toast.message = `Reminder set for ${this.selectedReminderTime} minutes from now`;
      toast.duration = 2000;
      toast.position = 'bottom';
      toast.color = 'success';
      document.body.appendChild(toast);
      await toast.present();
      
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      
      // Show error to user
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
   * Set which reminder time is selected
   */
  setReminderTime(minutes: number) {
    this.selectedReminderTime = minutes;
    console.log('Reminder time set to', minutes, 'minutes');
  }
  
  /**
   * Enable or disable the reminder feature
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
   * Confirm the receipt and schedule reminder if enabled
   */
  async confirmReceipt() {
    if (this.reminderEnabled && this.selectedReminderTime !== null) {
      await this.scheduleReminder();
    }
    
    this.confirmed.emit(this.receipt);
    this.modalController.dismiss(this.receipt);
  }
  
  cancelConfirmation() {
    this.canceled.emit();
    this.modalController.dismiss();
  }
}
