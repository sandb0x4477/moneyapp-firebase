import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubcategoryPageRoutingModule } from './subcategory-routing.module';

import { SubcategoryPage } from './subcategory.page';
import { EditAccCatPageModule } from '../../../_modals/edit-acc-cat/edit-acc-cat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubcategoryPageRoutingModule,
    EditAccCatPageModule
  ],
  declarations: [SubcategoryPage]
})
export class SubcategoryPageModule {}
