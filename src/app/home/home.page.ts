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

  catsRef: AngularFireList<any>;
  subCatsRef: AngularFireList<any>;
  accountRef: AngularFireList<any>;

  constructor(private db: AngularFireDatabase, private http: HttpClient) {
    // .startAt('2020-02-01')
    const transRef = db.list('transaction', ref => ref.orderByChild('date').startAt('2020-01-01'));
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
      });
  }

  ngOnInit(): void {
    // this.fetchCategory();
    // this.fetchSubCategory();
    // this.fetchAccount();
    // this.fetchTransaction();
    this.fetchTotals();
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
    this.totals['expense'].forEach( async item => {
      await totalsRef.set(item.month, {month: item.month, expense: item.expense}).then(_ => console.log('Done'));
    })
    this.totals['income'].forEach( async item => {
      await totalsRef.update(item.month, {income: item.income}).then(_ => console.log('Done'));
    })
    // {month: "2019-01", expense: 6305.29}
  }

  // importTransaction_() {
  //   const transRef = this.afs.collection('transaction');
  //   this.transaction.forEach(async item => {
  //     const keyRef = this.afs.createId();
  //     const payload = {
  //       fbId: keyRef,
  //       id: item.id,
  //       accountId: item.account_id,
  //       amount: item.amount,
  //       fullDate: new Date(item.full_date),
  //       shortDate: item.short_date,
  //       categoryName: item.category_name,
  //       memo: item.memo || null,
  //       isDeleted: item.is_deleted,
  //       mainCategoryId: item.main_category_id,
  //       subCategoryId: item.sub_category_id,
  //     };
  //     await transRef
  //       .doc('2019-01')
  //       .collection('trans')
  //       .doc(keyRef)
  //       .set(payload)
  //       .then(() => console.log('Done'));
  //   });
  // }
  // {
  //   "id": 93,
  //   "account_id": 6,
  //   "trans_type": 1,
  //   "amount": 67.00,
  //   "full_date": "2019-01-01 00:00:00.000000",
  //   "short_date": "2019-01-01",
  //   "category_name": "Beauty/Hair",
  //   "memo": null,
  //   "is_deleted": false,
  //   "main_category_id": 13,
  //   "sub_category_id": 67
  // }

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
