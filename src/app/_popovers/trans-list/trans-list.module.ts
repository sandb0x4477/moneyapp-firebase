import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { TransListComponent } from './trans-list.component';

@NgModule({
  imports: [ CommonModule, IonicModule,],
  declarations: [TransListComponent],
})
export class TransListModule {}
