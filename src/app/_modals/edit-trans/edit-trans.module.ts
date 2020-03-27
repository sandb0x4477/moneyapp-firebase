import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditTransPageRoutingModule } from './edit-trans-routing.module';

import { EditTransPage } from './edit-trans.page';
import { DatePickerPopupModule } from '../../_popovers/date-picker-popup/date-picker-popup.module';
import { AccountsPopupModule } from '../../_popovers/accounts-popup/accounts-popup.module';
import { CategoriesPopupModule } from '../../_popovers/categories-popup/categories-popup.module';
import { CalculatorPopupModule } from '../../_popovers/calculator-popup/calculator-popup.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditTransPageRoutingModule,
    DatePickerPopupModule,
    AccountsPopupModule,
    CategoriesPopupModule,
    CalculatorPopupModule,
  ],
  declarations: [EditTransPage],
})
export class EditTransPageModule {}
