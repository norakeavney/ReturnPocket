// Imports
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import {trigger,style,transition,animate,state} from '@angular/animations';
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
export class ReminderPickerComponent implements OnInit {
  @Input() receipt!: Receipt;
  @Output() reminderSet: EventEmitter<void> = new EventEmitter<void>();

  // Component state
  reminderDate: string = '';
  minDateTime: string = new Date().toISOString();
  isSubmitting: boolean = false;

  constructor(
    private reminderService: ReminderService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9:00 AM
    this.reminderDate = tomorrow.toISOString();
  }

  /**
   * Sets a reminder for the receipt.
   */
  async setReminder(): Promise<void> {
    if (this.isSubmitting) return; // Prevent double submission
    this.isSubmitting = true;
    
    try {
      if (!this.reminderDate || !this.receipt) {
        this.showToast('Please select a date and time', 'warning');
        this.isSubmitting = false;
        return;
      }

      const selected = new Date(this.reminderDate);
      const now = new Date();
      
      if (selected <= now) {
        this.showToast('Please select a future date and time', 'warning');
        this.isSubmitting = false;
        return;
      }

      const delayMins = Math.floor((selected.getTime() - now.getTime()) / 60000);
      console.log('Setting reminder for:', selected.toLocaleString(), 'Delay minutes:', delayMins);

      const notificationId = await this.reminderService.scheduleReminder(
        `Don't forget to use your ${this.receipt.store_name} receipt!`,
        delayMins
      );
      
      console.log('Reminder set with ID:', notificationId);
      this.showToast('Reminder set successfully!', 'success');
      setTimeout(() => this.reminderSet.emit(), 1000); // Give some time for the toast to show
    } catch (e) {
      console.error('Failed to set reminder:', e);
      this.showToast('Failed to set reminder. Please try again.', 'danger');
      this.isSubmitting = false;
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
   */
  handleReminderDone(): void {
    // This method is no longer needed as we removed the default buttons
    // But we'll keep it for backward compatibility
    this.setReminder();
  }
}
