import { Component, OnInit } from '@angular/core';
import { SqliteService, Receipt } from 'src/app/services/sqlite.service';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class StatsPage implements OnInit {
  receipts: Receipt[] = [];
  newReceipt: Receipt = {
    store_name: '',
    location: '',
    bottle_count: 0,
    total_amount: 0
  };

  constructor(
    private sqliteService: SqliteService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadReceipts();
  }

  ionViewWillEnter() {
    this.loadReceipts();
  }

  loadReceipts() {
    this.receipts = this.sqliteService.getReceipts();
  }

  async addReceipt() {
    if (!this.newReceipt.store_name || !this.newReceipt.location) {
      const alert = await this.alertController.create({
        header: 'Missing Information',
        message: 'Please fill in store name and location',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      await this.sqliteService.addReceipt(this.newReceipt);
      this.resetForm();
      this.loadReceipts();
    } catch (error) {
      console.error('Error adding receipt:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Failed to add receipt',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async deleteReceipt(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this receipt?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.sqliteService.deleteReceipt(id);
              this.loadReceipts();
            } catch (error) {
              console.error('Error deleting receipt:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  resetForm() {
    this.newReceipt = {
      store_name: '',
      location: '',
      bottle_count: 0,
      total_amount: 0
    };
  }
}
