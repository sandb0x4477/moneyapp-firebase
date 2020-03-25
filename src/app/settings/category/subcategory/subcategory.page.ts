import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonReorderGroup, ModalController } from '@ionic/angular';
import { SubSink } from 'subsink';
import { map, tap } from 'rxjs/operators';

import { FirebaseService } from '../../../_services/firebase.service';
import { SubCategoryModel } from '../../../_models/subcategory.model';
import { UtilityService } from '../../../_services/utility.service';
import { CategoryModel } from '../../../_models/category.model';
import { EditAccCatPage } from '../../../_modals/edit-acc-cat/edit-acc-cat.page';

@Component({
  selector: 'app-subcategory',
  templateUrl: './subcategory.page.html',
  styleUrls: ['./subcategory.page.scss'],
})
export class SubcategoryPage implements OnInit, OnDestroy {
  @ViewChild(IonReorderGroup, { static: false }) reorderGroup: IonReorderGroup;

  subs = new SubSink();
  subcategories: SubCategoryModel[];
  mainCategory: CategoryModel;

  constructor(
    public fbService: FirebaseService,
    private modalCtrl: ModalController,
    private utilitySrv: UtilityService,
  ) {}

  async ngOnInit() {
    this.mainCategory = await this.utilitySrv.dataTransferGet();
    console.log('TC: SubcategoryPage -> ngOnInit -> this.mainCategory', this.mainCategory);
    this.subs.sink = this.fbService.subcategories$
      .pipe(
        map(subcat => subcat.filter(s => s.isDeleted === false && s.mainCategoryId === this.mainCategory.id)),
      )
      .subscribe(res => {
        this.subcategories = res;
      });
  }

  addNewInModal() {
    const componentProps = {
      title: 'Add Subcategory',
      flag: 'add',
      type: 'subcategory',
      name: '',
    };
    this.presentModal(componentProps, EditAccCatPage);
  }

  editInModal(item: SubCategoryModel) {
    const componentProps = {
      title: 'Edit Subcategory',
      flag: 'edit',
      type: 'subcategory',
      name: item.subCatName,
      id: item.id,
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
    console.log('TC: SubCategoryPage -> presentModal -> data', data);
    if (!data) {
      return;
    }

    if (data.flag === 'add') {
      const payload: SubCategoryModel = {
        mainCategoryId: this.mainCategory.id,
        subCatName: data.name,
        isDeleted: false,
        type: this.mainCategory.type,
      };
      await this.fbService.addSubCategory(payload);
    }

    if (data.flag === 'edit') {
      const payload: Partial<SubCategoryModel> = {
        id: data.id,
        subCatName: data.name,
      };
      await this.fbService.updateSubCategory(payload);
    }

    if (data.flag === 'delete') {
      const payload = {
        id: data.id,
        isDeleted: true,
      };
      this.fbService.updateSubCategory(payload);
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
    this.fbService.onReorder(moveFrom, moveTo, 'subcatorder');
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
