import { Component } from '@angular/core';
import { SqliteService } from './services/sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  constructor(private sqliteService: SqliteService) {
    this.initialiseDB();
  }

  async initialiseDB() {
    await this.sqliteService.initDB();
  }
  
}
