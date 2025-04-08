import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Service to handle scheduling reminders using local notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  constructor() { }

  /**
   * Schedules a reminder notification.
   * 
   * @param message - The message to display in the notification.
   * @param delayInMins - The delay in minutes after which the notification should be shown.
   */
  async scheduleReminder(message: string, delayInMins: number) {
    await LocalNotifications.schedule({
      notifications: [{
        title: 'Return Pocket',
        body: message,
        id: 1,
        schedule: { at: new Date(Date.now() + delayInMins * 60000) }
      }]
    });
  }
}
