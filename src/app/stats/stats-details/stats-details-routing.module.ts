import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatsDetailsPage } from './stats-details.page';

const routes: Routes = [
  {
    path: '',
    component: StatsDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatsDetailsPageRoutingModule {}
