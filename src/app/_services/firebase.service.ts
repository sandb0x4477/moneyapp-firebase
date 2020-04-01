import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { switchMap, tap, map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import _isEqual from 'lodash.isequal';

import { TotalModel } from '../_models/total.model';
import { TransactionModel } from '../_models/transaction.model';
import { AccountModel } from '../_models/account.model';
import { CategoryModel } from '../_models/category.model';
import { SubCategoryModel } from '../_models/subcategory.model';
import { RepeatModel } from '../_models/repeat.model';

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
  dateQueryCalendar$: BehaviorSubject<Query | null>;
  dateQueryStats$: BehaviorSubject<Query | null>;

  transactionsCalendar$: Observable<TransactionModel[]>;
  transactionsDaily$: Observable<TransactionModel[]>;
  transactionsStats$: Observable<TransactionModel[]>;
  totals$: Observable<TotalModel[]>;
  accounts$: Observable<AccountModel[]>;
  categories$: Observable<CategoryModel[]>;
  subcategories$: Observable<SubCategoryModel[]>;
  repeat$: Observable<RepeatModel[]>;

  catorder: string[];
  subcatorder: string[];

  constructor(private db: AngularFireDatabase) {
    this.dateQuery$ = new BehaviorSubject(null);
    this.dateQueryDaily$ = new BehaviorSubject(null);
    this.dateQueryCalendar$ = new BehaviorSubject(null);
    this.dateQueryStats$ = new BehaviorSubject(null);

    // ! CATEGORY ORDERED
    this.categories$ = combineLatest([
      db.list<CategoryModel>('category').valueChanges(),
      db.list<string>('catorder').valueChanges(),
    ]).pipe(
      tap(([, catorder]) => {
        this.catorder = catorder;
      }),
      map(([categories, catorder]) => this.sortCategories(categories, catorder)),
      distinctUntilChanged(_isEqual),
      shareReplay(),
      tap(_ => console.log('CATEGORY HIT')),
    );

    this.subcategories$ = combineLatest([
      db.list<SubCategoryModel>('subcategory').valueChanges(),
      db.list<string>('subcatorder').valueChanges(),
    ]).pipe(
      tap(([, subcatorder]) => {
        this.subcatorder = subcatorder;
      }),
      map(([subcategories, subcatorder]) => this.sortSubCategories(subcategories, subcatorder)),
      distinctUntilChanged(_isEqual),
      shareReplay(),
      tap(_ => console.log('SUBCATEGORY HIT')),
    );

    // ? ACCOUNTS
    this.accounts$ = db
      .list<AccountModel>('account', ref => ref.orderByChild('accName'))
      .valueChanges()
      .pipe(
        tap(_ => console.log('ACCOUNTS HIT')),
        distinctUntilChanged(_isEqual),
        shareReplay(),
      );

    // ? TOTALS
    this.totals$ = db
      .list<TotalModel>('totals', ref => ref.orderByKey())
      .valueChanges()
      .pipe(
        distinctUntilChanged(_isEqual),
        shareReplay(),
        tap(_ => console.log('TOTALS HIT')),
      );

    // ? TRANSACTIONS DAILY
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
              .pipe(
                distinctUntilChanged(_isEqual),
                shareReplay(),
                tap(_ => console.log('TRANSACTIONS DAILY HIT')),
              )
          : of([]),
      ),
      // shareReplay(),
    );

    // ? TRANSACTIONS CALENDAR
    this.transactionsCalendar$ = this.dateQueryCalendar$.pipe(
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
              .pipe(
                distinctUntilChanged(_isEqual),
                shareReplay(),
                tap(_ => console.log('TRANSACTIONS CALENDAR HIT')),
              )
          : of([]),
      ),
    );

    // ? TRANSACTIONS STATS
    this.transactionsStats$ = this.dateQueryStats$.pipe(
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
      map(trans => trans.filter(t => t.type === 1)),
      distinctUntilChanged(_isEqual),
      shareReplay(),
      tap(_ => console.log('TRANSACTIONS STATS HIT')),
      // shareReplay(),
    );

    // ? REPEAT
    this.repeat$ = db
      .list<RepeatModel>('repeat', ref => ref.orderByChild('nextDate'))
      .valueChanges()
      .pipe(
        distinctUntilChanged(_isEqual),
        shareReplay(),
        tap(_ => console.log('REPEAT HIT')),
      );
  }
  // ! END OF CONSTRUCTOR ==============================================================

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

    if (trans.type === 0) {
      newEntry[`totals/${trans.month}`] = {
        ...total,
        income: trans.amount + total.income,
      };
    } else {
      newEntry[`totals/${trans.month}`] = {
        ...total,
        expense: trans.amount + total.expense,
      };
    }

    await this.db.database
      .ref()
      .update(newEntry)
      .catch(err => console.log(err));
  }

  // ? EDIT
  async updateTransaction(trans: Partial<TransactionModel>) {
    const totalRef = await this.db.database.ref(`/totals/${trans.month}`).once('value');
    const transRef = await this.db.database.ref(`/transaction/${trans.id}`).once('value');
    const transFb = transRef.val();
    const total = totalRef.val();
    const newEntry = {};
    const amountDiff = trans.amount - transFb.amount;
    // 30 - 20 = 10
    // 20 - 30 = -10

    newEntry[`transaction/${trans.id}`] = {
      ...trans,
    };

    if (amountDiff !== 0) {
      if (trans.type === 0) {
        newEntry[`totals/${trans.month}`] = {
          ...total,
          income: total.income + amountDiff,
        };
      } else {
        newEntry[`totals/${trans.month}`] = {
          ...total,
          expense: total.expense + amountDiff,
        };
      }
    }
    console.log('TC: updateTransaction -> newEntry', newEntry);
    await this.db.database
      .ref()
      .update(newEntry)
      .catch(err => console.log(err));
  }

  // ? DELETE
  async deleteTransaction(trans: Partial<TransactionModel>) {
    const totalRef = await this.db.database.ref(`/totals/${trans.month}`).once('value');
    const total = totalRef.val();
    const newEntry = {};
    // 30 - 20 = 10
    // 20 - 30 = -10

    newEntry[`transaction/${trans.id}`] = {};

    if (trans.type === 0) {
      newEntry[`totals/${trans.month}`] = {
        ...total,
        income: total.income - trans.amount,
      };
    } else {
      newEntry[`totals/${trans.month}`] = {
        ...total,
        expense: total.expense - trans.amount,
      };
    }

    console.log('TC: updateTransaction -> newEntry', newEntry);
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

  nextQueryCalendar(query: Query) {
    // console.log('TC: nextQuery -> query', query);
    this.dateQueryCalendar$.next(query);
  }

  nextQueryStats(query: Query) {
    // console.log('TC: nextQuery -> query', query);
    this.dateQueryStats$.next(query);
  }

  nextQuery(query: Query) {
    // console.log('TC: nextQuery -> query', query);
    this.dateQuery$.next(query);
  }

  // naiveObjectComparison(objOne: any, objTwo: any): boolean {
  //   return JSON.stringify(objOne) === JSON.stringify(objTwo);
  // }
}
