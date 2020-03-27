import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DailyPageRoutingModule } from './daily-routing.module';

import { DailyPage } from './daily.page';
import { DailyTransModule } from '../../_components/daily-trans/daily-trans.module';
import { EditTransPageModule } from '../../_modals/edit-trans/edit-trans.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DailyPageRoutingModule,
    DailyTransModule,
    EditTransPageModule
  ],
  declarations: [DailyPage]
})
export class DailyPageModule {}
