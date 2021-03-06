import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarPageRoutingModule } from './calendar-routing.module';

import { CalendarPage } from './calendar.page';
import { EditTransPageModule } from '../../_modals/edit-trans/edit-trans.module';
import { TransListModule } from '../../_popovers/trans-list/trans-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarPageRoutingModule,
    EditTransPageModule,
    TransListModule
  ],
  declarations: [CalendarPage]
})
export class CalendarPageModule {}
