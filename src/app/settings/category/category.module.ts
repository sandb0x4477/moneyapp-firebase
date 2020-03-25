import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CategoryPageRoutingModule } from './category-routing.module';

import { CategoryPage } from './category.page';
import { EditAccCatPageModule } from '../../_modals/edit-acc-cat/edit-acc-cat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoryPageRoutingModule,
    EditAccCatPageModule
  ],
  declarations: [CategoryPage]
})
export class CategoryPageModule {}
