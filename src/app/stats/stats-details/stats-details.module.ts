import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatsDetailsPageRoutingModule } from './stats-details-routing.module';

import { StatsDetailsPage } from './stats-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatsDetailsPageRoutingModule
  ],
  declarations: [StatsDetailsPage]
})
export class StatsDetailsPageModule {}
