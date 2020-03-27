import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditTransPage } from './edit-trans.page';

const routes: Routes = [
  {
    path: '',
    component: EditTransPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditTransPageRoutingModule {}
