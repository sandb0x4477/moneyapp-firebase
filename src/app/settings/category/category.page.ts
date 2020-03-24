import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonReorderGroup, ModalController } from '@ionic/angular';
import { SubSink } from 'subsink';
import { map } from 'rxjs/operators';
import _partition from 'lodash.partition';

import { FirebaseService } from '../../_services/firebase.service';
import { CategoryModel } from '../../_models/category.model';

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

  constructor(public fbService: FirebaseService) {}

  ngOnInit() {
    this.subs.sink = this.fbService.categories$
      .pipe(map(cat => cat.filter(c => c.isDeleted === false)))
      .subscribe(res => {
        [this.expenseCats, this.incomeCats] = _partition(res, ['type', 1]);
      });
  }

  addNewInModal() {}

  editInModal() {}

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
    this.fbService.onReorder(moveFrom, moveTo, 'catorder')
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
