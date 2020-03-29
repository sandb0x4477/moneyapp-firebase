import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { switchMap, tap, map, shareReplay } from 'rxjs/operators';

import { TotalModel } from '../_models/total.model';
import { TransactionModel } from '../_models/transaction.model';
import { AccountModel } from '../_models/account.model';
import { CategoryModel } from '../_models/category.model';
import { SubCategoryModel } from '../_models/subcategory.model';

interface Query {
  start: string;
  end: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  dateQuery$: BehaviorSubject<Query | null>;
  dateQueryDaily$: BehaviorSubject<Query | null>;

  transactions$: Observable<TransactionModel[]>;
  transactionsDaily$: Observable<TransactionModel[]>;
  totals$: Observable<TotalModel[]>;
  accounts$: Observable<AccountModel[]>;
  categories$: Observable<CategoryModel[]>;
  subcategories$: Observable<SubCategoryModel[]>;

  catorder: string[];
  subcatorder: string[];

  constructor(private db: AngularFireDatabase) {
    this.dateQuery$ = new BehaviorSubject(null);
    this.dateQueryDaily$ = new BehaviorSubject(null);

    // ! CATEGORY ORDERED
    this.categories$ = combineLatest([
      db.list<CategoryModel>('category').valueChanges(),
      db.list<string>('catorder').valueChanges(),
    ]).pipe(
      tap(([, catorder]) => {
        this.catorder = catorder;
      }),
      map(([categories, catorder]) => this.sortCategories(categories, catorder)),
      tap(_ => console.log('CATEGORY HIT')),
      shareReplay(),
    );

    this.subcategories$ = combineLatest([
      db.list<SubCategoryModel>('subcategory').valueChanges(),
      db.list<string>('subcatorder').valueChanges(),
    ]).pipe(
      tap(([, subcatorder]) => {
        this.subcatorder = subcatorder;
      }),
      map(([subcategories, subcatorder]) => this.sortSubCategories(subcategories, subcatorder)),
      tap(_ => console.log('SUBCATEGORY HIT')),
      shareReplay(),
    );

    // ? ACCOUNTS
    this.accounts$ = db
      .list<AccountModel>('account', ref => ref.orderByChild('accName'))
      .valueChanges()
      .pipe(
        tap(_ => console.log('ACCOUNTS HIT')),
        shareReplay(),
      );

    // ? TOTALS
    this.totals$ = db
      .list<TotalModel>('totals', ref => ref.orderByKey())
      .valueChanges()
      .pipe(
        tap(_ => console.log('TOTALS HIT')),
        shareReplay(),
      );

    // ? TRANSACTIONS
    this.transactionsDaily$ = this.dateQueryDaily$.pipe(
      switchMap(query =>
        query
          ? db
              .list<TransactionModel>('transaction', ref =>
                ref
                  .orderByChild('date')
                  .startAt(query.start)
                  .endAt(query.end),
              )
              .valueChanges()
          : of([]),
      ),
      tap(_ => console.log('TRANSACTIONS DAILY HIT')),
      // shareReplay(),
    );


    // ? TRANSACTIONS
    this.transactions$ = this.dateQuery$.pipe(
      switchMap(query =>
        query
          ? db
              .list<TransactionModel>('transaction', ref =>
                ref
                  .orderByChild('date')
                  .startAt(query.start)
                  .endAt(query.end),
              )
              .valueChanges()
          : of([]),
      ),
      tap(_ => console.log('TRANSACTIONS HIT')),
      // shareReplay(),
    );
  }

  sortCategories(categories: CategoryModel[], catorder: string[]) {
    const tempArr = [];
    catorder.forEach(el => tempArr.push(categories.find(e => e.id === el)));
    return tempArr;
  }

  sortSubCategories(subcategories: SubCategoryModel[], subcatorder: string[]) {
    const tempArr = [];
    subcatorder.forEach(el => tempArr.push(subcategories.find(e => e.id === el)));
    return tempArr;
  }

  async onReorder(moveFrom: string, moveTo: string, type: string) {
    const orderRef = this.db.list<string[]>(type);
    const orderTemp = [...this[type]];
    const moveFromIdx = orderTemp.indexOf(moveFrom);
    const moveToIdx = orderTemp.indexOf(moveTo);
    orderTemp.splice(moveFromIdx, 1);
    orderTemp.splice(moveToIdx, 0, moveFrom);

    await orderRef.set('/', orderTemp).then(() => console.log('Reorder OK'));
  }

  // ? =======================================================================================
  // ! TRANSACTIONS
  // ? ADD
  async addTransaction(trans: Partial<TransactionModel>) {
    const totalRef = await this.db.database.ref(`/totals/${trans.month}`).once('value');
    const total = totalRef.val();
    const keyRef = this.db.createPushId();
    const newEntry = {};

    newEntry[`transaction/${keyRef}`] = {
      ...trans,
      id: keyRef,
    };
    newEntry[`totals/${trans.month}`] = {
      ...total,
      expense: trans.amount + total.expense,
    };

    await this.db.database
      .ref()
      .update(newEntry)
      .catch(err => console.log(err));
  }

  // ? =======================================================================================
  // ! ACCOUNT
  // ? ADD
  async addAccount(payload: Partial<AccountModel>) {
    const accRef = this.db.list('account');
    const keyRef = this.db.createPushId();
    const newAccount = {
      ...payload,
      id: keyRef,
    };
    await accRef.set(keyRef, newAccount);
  }

  // ? EDIT
  async updateAccount(payload: Partial<AccountModel>) {
    const accRef = this.db.list('account');
    await accRef.update(payload.id, payload);
  }

  // ? ==================================================================
  // ! CATEGORY
  // ? ADD
  async addCategory(payload: Partial<CategoryModel>) {
    let orderTemp = [...this.catorder];
    const keyRef = this.db.createPushId();
    orderTemp.push(keyRef);

    const newEntry = {};
    newEntry[`category/${keyRef}`] = {
      ...payload,
      id: keyRef,
    };

    newEntry['/catorder'] = orderTemp;

    await this.db.database
      .ref()
      .update(newEntry)
      .catch(err => console.log(err));
  }

  // ? EDIT
  async updateCategory(payload: Partial<CategoryModel>) {
    const accRef = this.db.list('category');
    await accRef.update(payload.id, payload);
  }

  // ? ==================================================================
  // ! SUBCATEGORY
  // ? ADD
  async addSubCategory(payload: Partial<SubCategoryModel>) {
    let orderTemp = [...this.subcatorder];
    const keyRef = this.db.createPushId();
    orderTemp.push(keyRef);

    const newEntry = {};
    newEntry[`subcategory/${keyRef}`] = {
      ...payload,
      id: keyRef,
    };

    newEntry['/subcatorder'] = orderTemp;

    await this.db.database
      .ref()
      .update(newEntry)
      .catch(err => console.log(err));
  }

  // ? EDIT
  async updateSubCategory(payload: Partial<SubCategoryModel>) {
    const accRef = this.db.list('subcategory');
    await accRef.update(payload.id, payload);
  }

  nextQueryDaily(query: Query) {
    // console.log('TC: nextQuery -> query', query);
    this.dateQueryDaily$.next(query);
  }

  nextQuery(query: Query) {
    // console.log('TC: nextQuery -> query', query);
    this.dateQuery$.next(query);
  }
}
