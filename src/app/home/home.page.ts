import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { format, getUnixTime, fromUnixTime, parseISO } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Category {
  id: number;
  is_deleted: boolean;
  category_name: string;
  trans_type: number;
  order_seq: number;
  uid: string;
}

interface SubCategory {
  id: number;
  is_deleted: boolean;
  sub_category_name: string;
  trans_type: number;
  order_seq: number;
  main_category_id: number;
  uid: string;
}

interface Account {
  id: number;
  account_name: string;
  account_type: number;
  is_deleted: boolean;
  order_seq: number;
}
const ACCOUNTS = [
  {
    accountName: 'Cash',
    fbId: '-M2elScw9NSp8sxomCS6',
    id: 1,
    isDeleted: false,
    orderSeq: 1,
  },
  {
    accountName: 'CommBank',
    fbId: '-M2elSctDcg2EfxVb4FQ',
    id: 5,
    isDeleted: false,
    orderSeq: 2,
  },
  {
    accountName: 'Visa CC',
    fbId: '-M2elScv2kNQGvn3YU7p',
    id: 6,
    isDeleted: false,
    orderSeq: 3,
  },
];

const CATEGORIES = [
  {
    categoryName: 'Food',
    fbId: '-M2eltVFR8T426T5Egmh',
    id: 6,
    isDeleted: false,
    orderSeq: 101,
    transType: 1,
  },
  {
    categoryName: 'Household',
    fbId: '-M2eltVIlgOa5J6_2TOb',
    id: 11,
    isDeleted: false,
    orderSeq: 102,
    transType: 1,
  },
  {
    categoryName: 'Bills',
    fbId: '-M2eltVIlgOa5J6_2TOc',
    id: 68,
    isDeleted: false,
    orderSeq: 103,
    transType: 1,
  },
  {
    categoryName: 'Culture',
    fbId: '-M2eltVIlgOa5J6_2TOd',
    id: 10,
    isDeleted: false,
    orderSeq: 104,
    transType: 1,
  },
  {
    categoryName: 'Car',
    fbId: '-M2eltVJq5ftBKdh2_co',
    id: 56,
    isDeleted: false,
    orderSeq: 105,
    transType: 1,
  },
  {
    categoryName: 'Beauty',
    fbId: '-M2eltVJq5ftBKdh2_cp',
    id: 13,
    isDeleted: false,
    orderSeq: 106,
    transType: 1,
  },
  {
    categoryName: 'Clothes',
    fbId: '-M2eltVJq5ftBKdh2_cq',
    id: 12,
    isDeleted: false,
    orderSeq: 107,
    transType: 1,
  },
  {
    categoryName: 'Transportation',
    fbId: '-M2eltVJq5ftBKdh2_cr',
    id: 9,
    isDeleted: false,
    orderSeq: 108,
    transType: 1,
  },
  {
    categoryName: 'Health',
    fbId: '-M2eltVK_LQzgiI63skZ',
    id: 14,
    isDeleted: false,
    orderSeq: 109,
    transType: 1,
  },
  {
    categoryName: 'Gift',
    fbId: '-M2eltVK_LQzgiI63sk_',
    id: 16,
    isDeleted: false,
    orderSeq: 110,
    transType: 1,
  },
  {
    categoryName: 'Computer',
    fbId: '-M2eltVK_LQzgiI63ska',
    id: 15,
    isDeleted: false,
    orderSeq: 111,
    transType: 1,
  },
  {
    categoryName: 'Alcohol',
    fbId: '-M2eltVK_LQzgiI63skb',
    id: 55,
    isDeleted: false,
    orderSeq: 112,
    transType: 1,
  },
  {
    categoryName: 'Lucy Lu',
    fbId: '-M2eltVLXx4qKiNh5U5v',
    id: 101,
    isDeleted: false,
    orderSeq: 113,
    transType: 1,
  },
  {
    categoryName: 'Travel',
    fbId: '-M2eltVLXx4qKiNh5U5w',
    id: 17,
    isDeleted: false,
    orderSeq: 114,
    transType: 1,
  },
  {
    categoryName: 'Pipe',
    fbId: '-M2eltVLXx4qKiNh5U5x',
    id: 64,
    isDeleted: false,
    orderSeq: 115,
    transType: 1,
  },
  {
    categoryName: 'Salary',
    fbId: '-M2eltVLXx4qKiNh5U5y',
    id: 2,
    isDeleted: true,
    orderSeq: 116,
    transType: 0,
  },
  {
    categoryName: 'Petty cash',
    fbId: '-M2eltVLXx4qKiNh5U5z',
    id: 3,
    isDeleted: true,
    orderSeq: 117,
    transType: 0,
  },
  {
    categoryName: 'Gifts',
    fbId: '-M2eltVM9APZ5vr7k3rB',
    id: 4,
    isDeleted: false,
    orderSeq: 118,
    transType: 0,
  },
  {
    categoryName: 'Allowance',
    fbId: '-M2eltVM9APZ5vr7k3rC',
    id: 1,
    isDeleted: false,
    orderSeq: 119,
    transType: 0,
  },
  {
    categoryName: 'Social Life',
    fbId: '-M2eltVM9APZ5vr7k3rD',
    id: 7,
    isDeleted: true,
    orderSeq: 120,
    transType: 1,
  },
  {
    categoryName: 'Other',
    fbId: '-M2eltVM9APZ5vr7k3rE',
    id: 5,
    isDeleted: true,
    orderSeq: 121,
    transType: 0,
  },
  {
    categoryName: 'Self-development',
    fbId: '-M2eltVM9APZ5vr7k3rF',
    id: 8,
    isDeleted: true,
    orderSeq: 122,
    transType: 1,
  },
  {
    categoryName: 'Gifts',
    fbId: '-M2eltVNsU25b1sgEQ3S',
    id: 80,
    isDeleted: true,
    orderSeq: 181,
    transType: 0,
  },
];

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  category: Category[];
  subCategory: SubCategory[];
  account: Account[];
  transaction: any[];
  totals: any[];

  categoryFb$: Observable<any[]>;

  categoryFromFb: any[];
  subCategoryFromFb: any[];
  accountFromFb: any[];
  transactionFromFb: any[];
  catorderFromFb: any[];

  catsRef: AngularFireList<any>;
  subCatsRef: AngularFireList<any>;
  accountRef: AngularFireList<any>;

  constructor(private db: AngularFireDatabase, private http: HttpClient) {
    // .startAt('2020-02-01')
    /*     const transRef = db.list('transaction', ref => ref.orderByChild('date').startAt('2020-01-01'));
    transRef.valueChanges().subscribe(data => {
      // console.log('TC: HomePage -> transaction -> data', JSON.stringify(data, null, 2));
      this.transactionFromFb = data;
    });
    db.list('account')
      .valueChanges()
      .subscribe(res => {
        console.log('TC: HomePage -> account -> res', res);
        this.accountFromFb = res;
      });
    db.list('category')
      .valueChanges()
      .subscribe(res => {
        console.log('TC: HomePage -> category -> res', res);
        this.categoryFromFb = res;
      });
    db.list('subcategory')
      .valueChanges()
      .subscribe(res => {
        console.log('TC: HomePage -> subcategory -> res', res);
        this.subCategoryFromFb = res;
      }); */

      db.list('catorder/catorder')
      .valueChanges()
      .subscribe(res => {
        console.log('TC: HomePage -> catorder -> res', res);
        this.catorderFromFb = res;
      });
  }

  ngOnInit(): void {
    // this.fetchCategory();
    // this.fetchSubCategory();
    // this.fetchAccount();
    // this.fetchTransaction();
    // this.fetchTotals();
  }

  fetchCategory() {
    this.http.get('./assets/category.json').subscribe((res: Category[]) => {
      console.log('TC: HomePage -> fetchCategory -> res', res);
      this.category = res;
    });
  }

  fetchSubCategory() {
    this.http.get('./assets/subcategory.json').subscribe((res: SubCategory[]) => {
      console.log('TC: HomePage -> fetchSubCategory -> res', res);
      this.subCategory = res;
    });
  }

  fetchTransaction() {
    this.http.get('./assets/transaction.json').subscribe((res: any[]) => {
      // console.log('TC: HomePage -> transaction -> res', res);
      this.transaction = res;
    });
  }

  fetchTotals() {
    this.http.get('./assets/totals.json').subscribe((res: any[]) => {
      console.log('TC: HomePage -> totals -> res', res);
      this.totals = res;
    });
  }

  fetchAccount() {
    this.http.get('./assets/account.json').subscribe((res: Account[]) => {
      console.log('TC: HomePage -> fetchSubCategory -> res', res);
      this.account = res;
    });
  }

  importTransaction() {
    let tempArray = [];
    const transRef = this.db.list<any>('transaction');
    this.transaction.forEach(async item => {
      const category = this.categoryFromFb.find(c => c.id === item.main_category_id);
      const subcategoryIdx = this.subCategoryFromFb.findIndex(s => s.id === item.sub_category_id);
      const subcat = subcategoryIdx === -1 ? null : this.subCategoryFromFb[subcategoryIdx];
      const subCatName = subcat === null ? {} : subcat.subCategoryName;
      const subCategoryId = subcat === null ? null : subcat.fbId;
      const account = this.accountFromFb.find(a => a.id === item.account_id);
      const keyRef = this.db.createPushId();
      const payload = {
        id: keyRef,
        // id: item.id,
        accId: account.fbId,
        accName: account.accountName,
        type: item.trans_type,
        amount: item.amount,
        time: item.full_date.slice(11, 19),
        date: item.short_date,
        month: item.short_date.slice(0, 7),
        catFull: item.category_name,
        memo: item.memo || null,
        deleted: item.is_deleted,
        mainCatId: category.fbId,
        catName: category.categoryName,
        subCatId: subCategoryId,
        subCatName,
      };
      // tempArray.push(payload);
      await transRef.set(`${keyRef}`, payload).then(_ => console.log('Done'));
    });
    // console.log('TC: HomePage -> imporTransaction -> tempArray', tempArray);
  }

  importTotals() {
    const totalsRef = this.db.list<any>('totals');
    this.totals['expense'].forEach(async item => {
      await totalsRef
        .set(item.month, { month: item.month, expense: item.expense })
        .then(_ => console.log('Done'));
    });
    this.totals['income'].forEach(async item => {
      await totalsRef.update(item.month, { income: item.income }).then(_ => console.log('Done'));
    });
    // {month: "2019-01", expense: 6305.29}
  }

  replaceAccounts() {
    const accRef = this.db.list('account');
    ACCOUNTS.forEach(async item => {
      const payload = {
        id: item.fbId,
        accName: item.accountName,
        isDeleted: item.isDeleted,
      };
      console.log('TC: HomePage -> replaceAccounts -> payload', payload);
      await accRef.set(payload.id, payload).then(() => console.log('Done'));
    });
  }

  replaceCategories() {
    const catsRef = this.db.list('category');
    CATEGORIES.forEach(async item => {
      const payload = {
        id: item.fbId,
        catName: item.categoryName,
        isDeleted: item.isDeleted,
        type: item.transType,
      };
      await catsRef.set(payload.id, payload).then(() => console.log('Done'));
    });
  }

  async replaceCatsOrder() {
    const catsOrderRef = this.db.list('catorder');
    let tempArr = [];
    CATEGORIES.forEach(item => {
      tempArr.push(item.fbId);
    });
    console.log('TC: HomePage -> replaceCatsOrder -> tempArr', tempArr);
    await catsOrderRef.set('catorder', tempArr);
  }

  importCategory() {
    this.catsRef = this.db.list<any>('category');
    this.category.forEach(async item => {
      const keyRef = this.db.createPushId();
      const payload = {
        fbId: keyRef,
        id: item.id,
        isDeleted: item.is_deleted,
        categoryName: item.category_name,
        transType: item.trans_type,
        orderSeq: item.order_seq,
      };
      await this.catsRef.set(keyRef, payload).then(_ => console.log('Done'));
    });
  }

  importSubCategory() {
    this.subCatsRef = this.db.list<any>('subcategory');
    this.subCategory.forEach(async item => {
      const mainCategoryIdFb = this.categoryFromFb.find(c => c.id === item.main_category_id).fbId;
      const keyRef = this.db.createPushId();
      const payload = {
        fbId: keyRef,
        id: item.id,
        isDeleted: item.is_deleted,
        subCategoryName: item.sub_category_name,
        transType: item.trans_type,
        orderSeq: item.order_seq,
        mainCategoryId: item.main_category_id,
        mainCategoryIdFb,
      };
      await this.subCatsRef.set(keyRef, payload).then(_ => console.log('Done'));
    });
  }

  importAccount() {
    this.accountRef = this.db.list<any>('account');
    this.account.forEach(async item => {
      const keyRef = this.db.createPushId();
      // const key = item.id.toString();
      const payload = {
        fbId: keyRef,
        id: item.id,
        isDeleted: item.is_deleted,
        accountName: item.account_name,
        orderSeq: item.order_seq,
      };
      await this.accountRef.set(keyRef, payload).then(_ => console.log('Done'));
    });
  }
}

/*   categoryName: "Food"
fbId: "-M2eltVFR8T426T5Egmh"
id: 6
isDeleted: false
orderSeq: 101
transType: 1 */
