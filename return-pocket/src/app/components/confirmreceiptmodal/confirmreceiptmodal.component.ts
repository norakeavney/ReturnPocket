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
      this.receipt.bottle_count = 0;
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
  
  setReminderTime(minutes: number) {
    this.selectedReminderTime = minutes;
  }
  
  scheduleReminder() {
    if (this.reminderEnabled && this.selectedReminderTime) {
      const storeName = this.receipt.store_name || 'Unknown Store';
      const amount = this.receipt.total_amount.toFixed(2);
      const message = `Don't forget to scan your ${storeName} receipt for €${amount} at the till!`;
      
      this.reminderService.scheduleReminder(message, this.selectedReminderTime);
    }
  }
  
  // Add this method to handle the reminder toggle
  setReminderEnabled(enabled: boolean) {
    this.reminderEnabled = enabled;
    // When enabling, select the first option by default and force change detection
    if (enabled) {
      if (this.selectedReminderTime === null) {
        this.selectedReminderTime = this.reminderTimes[0].value;
      }
      
      // Force UI refresh with a slight delay
      setTimeout(() => {
        this.selectedReminderTime = this.selectedReminderTime;
      }, 50);
    }
  }

  confirmReceipt() {
    if (this.reminderEnabled && this.selectedReminderTime) {
      this.scheduleReminder();
    }
    this.confirmed.emit(this.receipt);
    this.modalController.dismiss(this.receipt);
  }
  
  cancelConfirmation() {
    this.canceled.emit();
    this.modalController.dismiss();
  }
}
