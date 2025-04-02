// Imports
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import {trigger,style,transition,animate,state} from '@angular/animations'; // Animation imports
import { ReminderService } from '../../services/reminder.service';
import { Receipt } from '../../services/sqlite.service';

/**
 * Component for picking reminder dates(notifications) for receipts
 * Includes animation for smooth entry/exit transitions
 */
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
  @Output() reminderSet: EventEmitter<void> = new EventEmitter<void>();

  // Component state
  reminderDate: string = '';
  minDateTime: string = new Date().toISOString();

  constructor(
    private reminderService: ReminderService,
    private toastCtrl: ToastController
  ) {}

  /**
   * Sets a reminder for the receipt.
   * 
   * This method validates the selected reminder date and schedules a notification
   * if the date is valid. It ensures that the reminder is set for a future date
   * and calculates the delay in minutes before scheduling the reminder.
   * 
   * @returns {Promise<void>} A promise that resolves when the reminder is set or rejects on failure.
   */
  async setReminder(): Promise<void> {
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
      console.error('Failed to set reminder:', e);
      this.showToast('Failed to set reminder', 'danger');
    }
  }

  /**
   * Displays a toast message to the user.
   * 
   * This method creates and presents a toast notification with the specified
   * message and color. The toast is displayed at the bottom of the screen for
   * a duration of 2 seconds.
   * 
   * @param {string} message - The message to display.
   * @param {'success' | 'warning' | 'danger'} color - The color of the toast, indicating its type.
   * @returns {Promise<void>} A promise that resolves when the toast is presented.
   */
  private async showToast(
    message: string, 
    color: 'success' | 'warning' | 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  /**
   * Handler for reminder completion.
   * 
   * This method is triggered when the reminder is marked as done. It calls
   * the `setReminder` method to ensure the reminder is properly set.
   */
  handleReminderDone(): void {
    this.setReminder();
  }
}
