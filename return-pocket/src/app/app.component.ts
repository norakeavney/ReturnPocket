import { Component } from '@angular/core';
import { SqliteService } from './services/sqlite.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  constructor(private sqliteService: SqliteService, private supa: SupabaseService) {
    this.initApp();
  }

  async initApp() {
    await this.sqliteService.initialise();
    const user = await this.supa.getCurrentUser();
    if (user) this.supa.syncData();
    SplashScreen.hide();
  }
  
} 
