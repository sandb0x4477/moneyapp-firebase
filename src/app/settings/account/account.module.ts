import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AccountPageRoutingModule } from './account-routing.module';
import { AccountPage } from './account.page';
import { EditAccCatPageModule } from '../../_modals/edit-acc-cat/edit-acc-cat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountPageRoutingModule,
    EditAccCatPageModule
  ],
  declarations: [AccountPage]
})
export class AccountPageModule {}
