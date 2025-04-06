import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeaderboardsPage } from './leaderboards.page';

const routes: Routes = [
  {
    path: '',
    component: LeaderboardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaderboardsPageRoutingModule {}
