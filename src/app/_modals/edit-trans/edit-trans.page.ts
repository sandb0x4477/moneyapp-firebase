import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { format } from 'date-fns';
import { SubSink } from 'subsink';
import { map } from 'rxjs/operators';
import _partition from 'lodash.partition';

import { TransactionModel } from '../../_models/transaction.model';
import { REPEAT_TYPES } from '../../_config/repeat.types';
import { DatePickerPopupComponent } from '../../_popovers/date-picker-popup/date-picker-popup.component';
import { AccountsPopupComponent } from '../../_popovers/accounts-popup/accounts-popup.component';
import { CategoriesPopupComponent } from '../../_popovers/categories-popup/categories-popup.component';
import { FirebaseService } from '../../_services/firebase.service';
import { AccountModel } from '../../_models/account.model';
import { CategoryModel } from '../../_models/category.model';
import { SubCategoryModel } from '../../_models/subcategory.model';
import { CalculatorPopupComponent } from '../../_popovers/calculator-popup/calculator-popup.component';

@Component({
  selector: 'app-edit-trans',
  templateUrl: './edit-trans.page.html',
  styleUrls: ['./edit-trans.page.scss'],
})
export class EditTransPage implements OnInit, OnDestroy {
  subs = new SubSink();

  @Input() title: string;
  @Input() flag: string;
  @Input() type: number;
  @Input() selectedDate: Date = new Date();
  @Input() trans: Partial<TransactionModel>;

  accounts: AccountModel[];
  expenseCats: CategoryModel[];
  incomeCats: CategoryModel[];
  subcategories: SubCategoryModel[];

  repeatTypes = REPEAT_TYPES;
  selectedRepeatMode = 0;

  constructor(
    public fbService: FirebaseService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
  ) {}

  ngOnInit() {
    this.subs.sink = this.fbService.accounts$
      .pipe(map(a => a.filter(a => a.isDeleted === false)))
      .subscribe(res => {
        this.accounts = res;
      });

    this.subs.sink = this.fbService.categories$
      .pipe(map(a => a.filter(a => a.isDeleted === false)))
      .subscribe(res => {
        [this.expenseCats, this.incomeCats] = _partition(res, ['type', 1]);
      });

    this.subs.sink = this.fbService.subcategories$
      .pipe(map(a => a.filter(a => a.isDeleted === false)))
      .subscribe(res => {
        this.subcategories = res;
      });
  }

  onSubmit() {
    this.trans.date = format(this.selectedDate, 'yyyy-MM-dd');
    this.trans.time = format(new Date(), 'HH:mm:ss');
    this.trans.deleted = false;
    this.trans.month = format(this.selectedDate, 'yyyy-MM');
    // TODO change
    this.trans.type = 1;
    const data: any = {
      repeatType: this.selectedRepeatMode,
      trans: this.trans,
    };
    this.modalCtrl.dismiss(data);
  }

  onDelete() {}

  // ! DATE PICKER
  async openDatePicker(event: any) {
    const popover = await this.popoverCtrl.create({
      component: DatePickerPopupComponent,
      event,
      componentProps: {
        selectedDate: this.selectedDate,
      },
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();
    if (data) {
      this.selectedDate = data.selectedDate;
    }
  }

  // ? ACCOUNT PICKER
  async openAccountsPopup(event: any) {
    const popover = await this.popoverCtrl.create({
      component: AccountsPopupComponent,
      event,
      componentProps: {
        accounts: this.accounts,
      },
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();
    if (data) {
      this.trans.accId = data.id;
      this.trans.accName = data.accName;
    }
  }

  // ? CATEGORY PICKER
  async openCategoriesPopup(event: any) {
    const popover = await this.popoverCtrl.create({
      component: CategoriesPopupComponent,
      event,
      componentProps: {
        expenseCats: this.expenseCats,
        incomeCats: this.incomeCats,
        subcategories: this.subcategories,
        type: 1
      },
      cssClass: 'categories-popup',
    });

    await popover.present();
    const { data } = await popover.onWillDismiss();

    if (data) {
      console.log('TC: AddEditTransactionComponent -> openCategoriesPopup -> data', data);
      this.trans.mainCatId = data.mainCategory.id,
      this.trans.catName = data.mainCategory.catName,
      this.trans.subCatId = data.subCategory?.id || null,
      this.trans.subCatName = data.subCategory?.subCatName || null,
      this.trans.catFull = this.categoryFull
    }
  }

  // ? CALCULATOR POPUP
  async openCalculator(event: any) {
    const popover = await this.popoverCtrl.create({
      component: CalculatorPopupComponent,
      event,
      componentProps: {
        // currentNumber: this.selectedAccount || '0'
      },
      cssClass: 'calculator-popup',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();
    if (data) {
      console.log('TC: AddEditTransactionComponent -> openCalculator -> data', data);
      this.trans.amount = data
    }
  }


  get categoryFull() {
    if (this.trans.catName && this.trans.subCatName) {
      return `${this.trans.catName}/${this.trans.subCatName}`
    } else if (this.trans.catName) {
      return this.trans.catName
    } else {
      return '';
    }

  }

  isDisabled() {
    const {accName, amount, catName } = this.trans;
    if (accName && amount && catName) {
      return false;
    }
    return true;
  }

  onRepeatChoice(event: any) {
    // console.log('TC: AddEditTransactionComponent -> selectedRepeatMode -> ', this.selectedRepeatMode);
  }

  async dismissModal(data: any = null) {
    await this.modalCtrl.dismiss(data);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}