import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  constructor() { }

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
