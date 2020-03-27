import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatsPage } from './stats.page';

const routes: Routes = [
  {
    path: '',
    component: StatsPage
  },
  {
    path: 'detail/:id',
    loadChildren: () => import('./stats-details/stats-details.module').then( m => m.StatsDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatsPageRoutingModule {}
