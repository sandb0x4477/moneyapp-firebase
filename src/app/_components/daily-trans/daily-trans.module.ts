import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { DailyTransComponent } from './daily-trans.component';

@NgModule({
  declarations: [DailyTransComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [DailyTransComponent]
})
export class DailyTransModule { }
