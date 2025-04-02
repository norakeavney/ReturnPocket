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
    if (!this.receipt || !this.reminderDate) return;
  
    const selected = new Date(this.reminderDate);
    if (selected <= new Date()) {
      return this.showToast('Please select a future date and time', 'warning');
    }
  
    const delayMins = Math.floor((selected.getTime() - Date.now()) / 60000);
    try {
      await this.reminderService.scheduleReminder(
        `Don't forget to use your ${this.receipt.store_name} receipt!`,
        delayMins
      );
      this.reminderSet = true;
      this.reminderModalOpen = false;
      this.showToast('Reminder set successfully!', 'success');
    } catch (e) {
      console.error(e);
      this.showToast('Failed to set reminder', 'danger');
    }
  
  

    this.reminderModalOpen = false; // closes the modal
  }

  async showToast(msg: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
  
  

  onLogoError() {
    this.storeLogoPath = 'assets/resources/other.png';
  }

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
