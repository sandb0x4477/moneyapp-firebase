import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonReorderGroup, ModalController } from '@ionic/angular';
import { SubSink } from 'subsink';
import { map, tap } from 'rxjs/operators';
import _partition from 'lodash.partition';

import { FirebaseService } from '../../_services/firebase.service';
import { CategoryModel } from '../../_models/category.model';
import { EditAccCatPage } from '../../_modals/edit-acc-cat/edit-acc-cat.page';
import { UtilityService } from '../../_services/utility.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit, OnDestroy {
  @ViewChild(IonReorderGroup, { static: false }) reorderGroup: IonReorderGroup;

  subs = new SubSink();
  incomeCats: CategoryModel[];
  expenseCats: CategoryModel[];

  constructor(
    public fbService: FirebaseService,
    private modalCtrl: ModalController,
    private utilitySrv: UtilityService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subs.sink = this.fbService.categories$
      .pipe(
        // tap(res => console.log('TC: CategoryPage -> ngOnInit -> ', res)),
        map(cat => cat.filter(c => c.isDeleted === false)),
      )
      .subscribe(res => {
        [this.expenseCats, this.incomeCats] = _partition(res, ['type', 1]);
      });
  }

  addNewInModal() {
    const componentProps = {
      title: 'Add Category',
      flag: 'add',
      type: 'category',
      name: '',
    };
    this.presentModal(componentProps, EditAccCatPage);
  }

  editInModal(item: CategoryModel) {
    const componentProps = {
      title: 'Edit Category',
      flag: 'edit',
      type: 'category',
      name: item.catName,
      id: item.id,
      incomeExpense: item.type === 1 ? 'Expense' : 'Income',
    };
    this.presentModal(componentProps, EditAccCatPage);
  }

  async presentModal(componentProps: any, component: any) {
    const modal = await this.modalCtrl.create({
      component,
      componentProps,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    console.log('TC: CategoryPage -> presentModal -> data', data);
    if (!data) {
      return;
    }

    if (data.flag === 'add') {
      const payload: CategoryModel = {
        catName: data.name,
        isDeleted: false,
        type: data.incomeExpense === 'Expense' ? 1 : 0,
      };
      await this.fbService.addCategory(payload);
    }

    if (data.flag === 'edit') {
      const payload: Partial<CategoryModel> = {
        id: data.id,
        catName: data.name,
      };
      await this.fbService.updateCategory(payload);
    }

    if (data.flag === 'delete') {
      const payload = {
        id: data.id,
        isDeleted: true,
      };
      this.fbService.updateCategory(payload);
    }
  }

  // ! REORDER
  doReorder(ev: any, type: string) {
    let moveFrom: string;
    let moveTo: string;

    moveFrom = this[type][ev.detail.from].id;

    if (ev.detail.to === this[type].length) {
      moveTo = this[type][ev.detail.to - 1].id;
    } else {
      moveTo = this[type][ev.detail.to].id;
    }

    ev.detail.complete();
    this.fbService.onReorder(moveFrom, moveTo, 'catorder');
  }

  async navtigateToSubcategory(item: CategoryModel) {
    await this.utilitySrv.dataTransferSet(item);
    this.router.navigate(['app/settings/category/sub', item.id]);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
