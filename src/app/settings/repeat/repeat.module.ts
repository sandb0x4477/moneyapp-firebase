import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RepeatPageRoutingModule } from './repeat-routing.module';

import { RepeatPage } from './repeat.page';
import { EditTransPageModule } from '../../_modals/edit-trans/edit-trans.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RepeatPageRoutingModule,
    EditTransPageModule
  ],
  declarations: [RepeatPage]
})
export class RepeatPageModule {}
