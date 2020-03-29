import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionsPageRoutingModule } from './transactions-routing.module';

import { TransactionsPage } from './transactions.page';
import { CalMonthSelModule } from '../_popovers/cal-month-sel/cal-month-sel.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsPageRoutingModule,
    CalMonthSelModule
  ],
  declarations: [TransactionsPage]
})
export class TransactionsPageModule {}
