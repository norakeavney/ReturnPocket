import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Receipt } from '../../services/sqlite.service';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

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

  constructor(private modalController: ModalController) { }

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
  
  confirmReceipt() {
    this.confirmed.emit(this.receipt);
    this.modalController.dismiss(this.receipt);
  }
  
  cancelConfirmation() {
    this.canceled.emit();
    this.modalController.dismiss();
  }
}
