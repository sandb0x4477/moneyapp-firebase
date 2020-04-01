import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RepeatPage } from './repeat.page';

const routes: Routes = [
  {
    path: '',
    component: RepeatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepeatPageRoutingModule {}
