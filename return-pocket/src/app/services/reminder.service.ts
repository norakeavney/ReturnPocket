import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Service to handle scheduling reminders using local notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  constructor() {
    // Permissions are already handled at app boot
  }

  /**
   * Schedules a reminder notification.
   * 
   * @param message - The message to display in the notification.
   * @param delayInMins - The delay in minutes after which the notification should be shown.
   */
  async scheduleReminder(message: string, delayInMins: number) {
    try {
      const notificationId = new Date().getTime(); // Generate unique ID based on timestamp
      const scheduleTime = new Date(Date.now() + delayInMins * 60000);
      
      console.log(`Scheduling notification ID ${notificationId} for ${scheduleTime.toLocaleString()}`);
      
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Return Pocket Reminder',
          body: message,
          id: notificationId,
          schedule: { at: scheduleTime },
          sound: 'default'
        }]
      });
      
      // Verify scheduled notifications
      const pending = await LocalNotifications.getPending();
      console.log('Pending notifications:', pending);
      
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }
}
