import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { SubCategoryModel } from '../../_models/subcategory.model';
import { CategoryModel } from '../../_models/category.model';

@Component({
  selector: 'app-categories-popup',
  templateUrl: './categories-popup.component.html',
  styleUrls: ['./categories-popup.component.scss'],
})
export class CategoriesPopupComponent implements OnInit {
  @Input() expenseCats: CategoryModel[];
  @Input() incomeCats: CategoryModel[];
  @Input() subcategories: SubCategoryModel[];
  @Input() type: number;

  @Input() mainCategory: CategoryModel;
  @Input() subCategory: SubCategoryModel;

  filteredSubCategories: SubCategoryModel[] = [];
  emptyItems: string[];
  selectedItemId = '';

  clickTimes = 0;

  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {}

  onMainCategoryClick(item: CategoryModel, space: number) {
    this.mainCategory = item;
    if (item.id === this.selectedItemId) {
      this.popoverCtrl.dismiss({
        mainCategory: this.mainCategory,
        subCategory: this.subCategory || null,
      });
    } else {
      this.selectedItemId = item.id;
    }
    this.emptyItems = [];
    for (let i = 0; i < space; i++) {
      this.emptyItems.push(i.toString());
    }
    this.filteredSubCategories = this.subcategories.filter(s => s.mainCategoryId === item.id);
  }

  onSubcategoryClick(item: SubCategoryModel) {
    this.subCategory = item;
    this.popoverCtrl.dismiss({
      mainCategory: this.mainCategory,
      subCategory: this.subCategory,
    });
  }

  itemHasSubcategories(id: string) {
    const subcats = this.subcategories.filter((s: SubCategoryModel) => s.mainCategoryId === id);
    return subcats.length;
  }
}
