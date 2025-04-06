import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeaderboardsPageRoutingModule } from './leaderboards-routing.module';

import { LeaderboardsPage } from './leaderboards.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeaderboardsPageRoutingModule
  ],
  declarations: [LeaderboardsPage]
})
export class LeaderboardsPageModule {}
