// Imports
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import {trigger, style, transition, animate, state} from '@angular/animations';
import { ReminderService } from '../../services/reminder.service';
import { Receipt } from '../../services/sqlite.service';

/**
 * ReminderPickerComponent
 * 
 * A modal component that allows users to select a date and time for setting reminders for receipts.
 * Features an animated transition for smooth entry and exit effects.
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
  /** The receipt for which the reminder is being set */
  @Input() receipt!: Receipt;
  
  /** Event emitted when a reminder is successfully set or the picker is dismissed */
  @Output() reminderSet: EventEmitter<void> = new EventEmitter<void>();

  /** Selected date and time for the reminder */
  reminderDate: string = '';
  
  /** Minimum selectable date-time (current time) */
  minDateTime: string = new Date().toISOString();
  
  /** Flag to prevent multiple submissions */
  isSubmitting: boolean = false;

  /**
   * Creates an instance of ReminderPickerComponent.
   * @param reminderService - Service for scheduling notification reminders
   * @param toastCtrl - Controller for displaying toast notifications
   */
  constructor(
    private reminderService: ReminderService,
    private toastCtrl: ToastController
  ) {}

  /**
   * Lifecycle hook that initializes the component.
   * Sets default reminder time to 9:00 AM tomorrow.
   */
  ngOnInit() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    this.reminderDate = tomorrow.toISOString();
  }

  /**
   * Schedules a reminder notification for the receipt.
   * Validates the selected date and time before setting the reminder.
   * Emits the reminderSet event upon successful completion.
   * 
   * @returns Promise that resolves when the reminder is set or rejected on validation failure
   */
  async setReminder(): Promise<void> {
    if (this.isSubmitting) return;
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
      setTimeout(() => this.reminderSet.emit(), 1000);
    } catch (e) {
      console.error('Failed to set reminder:', e);
      this.showToast('Failed to set reminder. Please try again.', 'danger');
      this.isSubmitting = false;
    }
  }

  /**
   * Displays a toast notification to the user.
   * 
   * @param message - The notification message to display
   * @param color - The color theme of the toast indicating its type (success, warning, or danger)
   * @returns Promise that resolves when the toast is presented
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
   * Legacy handler for reminder completion.
   * Maintained for backward compatibility but functionally equivalent to setReminder.
   */
  handleReminderDone(): void {
    this.setReminder();
  }
}
