import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  standalone: false,
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor() { }

  ngOnInit() {

    // Code to put here for when the app starts what do we want it to do when it first boots?
    // Sync to the SQLite start loading their receipts in the background while the app boots?

  }

}
