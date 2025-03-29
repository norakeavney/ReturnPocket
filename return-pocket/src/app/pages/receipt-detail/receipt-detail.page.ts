import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SqliteService, Receipt } from '../../services/sqlite.service';
import { ReminderService } from '../../services/reminder.service';
import { ToastController } from '@ionic/angular';


@Component({
  standalone: false,
  selector: 'app-receipt-detail',
  templateUrl: './receipt-detail.page.html',
  styleUrls: ['./receipt-detail.page.scss'],
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
    private reminderService: ReminderService,
    private toastCtrl: ToastController
  ) {}

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

  openReminderModal() {
    this.reminderModalOpen = true;
  }

  async setReminder() {
    if (!this.reminderDate || !this.receipt) return;
    
    const selectedDate = new Date(this.reminderDate);
    if (selectedDate <= new Date()) {
      const toast = await this.toastCtrl.create({
        message: 'Please select a future date and time',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    const delayInMins = Math.floor((selectedDate.getTime() - Date.now()) / 60000);
    if (delayInMins <= 0) {
      console.warn('Date must be in the future');
      return;
    }
    
    try {
      await this.reminderService.scheduleReminder(
        `Don't forget to use your ${this.receipt.store_name} receipt!`,
        delayInMins
      );
      this.reminderSet = true;
      this.reminderModalOpen = false;
      console.log('Reminder set for', selectedDate);
      const toast = await this.toastCtrl.create({
        message: 'Reminder set successfully!',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }

    this.reminderModalOpen = false; // closes the modal
  }
  
  getLogoPath(storeName: string): string {
    const normalizedName = storeName.toLowerCase().replace(/\s+/g, '-');
    return `assets/resources/${normalizedName}.png`;
  }

  onLogoError() {
    this.storeLogoPath = 'assets/resources/other.png';
  }

 
}
