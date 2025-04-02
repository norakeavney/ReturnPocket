import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { ReminderService } from '../../services/reminder.service';
import { Receipt } from '../../services/sqlite.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  trigger, style, transition, animate, state
} from '@angular/animations';


@Component({
  selector: 'app-reminder-picker',
  templateUrl: './reminder-picker.component.html',
  styleUrls: ['./reminder-picker.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  animations: [
    trigger('popup', [
      state('void', style({ 
        opacity: 0, 
        transform: 'translateY(20px)' 
      })),
      transition(':enter', [
        animate('300ms ease-out', style({ 
          opacity: 1, 
          transform: 'translateY(0)' 
        }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ 
          opacity: 0, 
          transform: 'translateY(20px)' 
        }))
      ])
    ])
  ]
})
export class ReminderPickerComponent {
  @Input() receipt!: Receipt;
  @Output() reminderSet = new EventEmitter<void>();

  reminderDate: string = '';
  minDateTime = new Date().toISOString();

  constructor(
    private reminderService: ReminderService,
    private toastCtrl: ToastController
  ) {}

  async setReminder() {
    if (!this.reminderDate || !this.receipt) return;

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
      this.showToast('Reminder set successfully!', 'success');
      this.reminderSet.emit();
    } catch (e) {
      console.error(e);
      this.showToast('Failed to set reminder', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  handleReminderDone() {
    this.setReminder(); 
  }
  
}
