import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, map } from 'rxjs/operators';

import { TotalModel } from '../_models/total.model';
import { TransactionModel } from '../_models/transaction.model';
import { AccountModel } from '../_models/account.model';
import { CategoryModel } from '../_models/category.model';

interface Query {
  start: string;
  end: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  dateQuery$: BehaviorSubject<Query | null>;

  transactions$: Observable<TransactionModel[]>;
  totals$: Observable<TotalModel[]>;
  accounts$: Observable<AccountModel[]>;
  categories$: Observable<CategoryModel[]>;
  catorder: string[];

  constructor(private db: AngularFireDatabase) {
    this.dateQuery$ = new BehaviorSubject(null);

    // ! CATEGORY ORDERED
    this.categories$ = combineLatest([
      db.list<CategoryModel>('category').valueChanges(),
      db.list<string>('catorder/catorder').valueChanges(),
    ]).pipe(
      tap(([, catorder]) => {
        this.catorder = catorder;
      }),
      map(([categories, catorder]) => this.sortCategories(categories, catorder)),
      distinctUntilChanged(),
    );

    // ? ACCOUNTS
    this.accounts$ = db
      .list<AccountModel>('account', ref => ref.orderByChild('accName'))
      .valueChanges()
      .pipe(distinctUntilChanged());

    // ? TOTALS
    this.totals$ = db
      .list<TotalModel>('totals', ref => ref.orderByKey())
      .valueChanges()
      .pipe(distinctUntilChanged());

    // ! TRANSACTIONS
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
      distinctUntilChanged(),
    );
  }

  sortCategories(categories: CategoryModel[], catorder: string[]) {
    const tempArr = [];
    catorder.forEach(el => tempArr.push(categories.find(e => e.id === el)));
    return tempArr;
  }

  async onReorder(moveFrom: string, moveTo: string, type: string) {
    const orderRef = this.db.list<string[]>(type);
    const orderTemp = [...this[type]];
    const moveFromIdx = orderTemp.indexOf(moveFrom);
    const moveToIdx = orderTemp.indexOf(moveTo);
    orderTemp.splice(moveFromIdx, 1);
    orderTemp.splice(moveToIdx, 0, moveFrom);

    await orderRef.set(type, orderTemp).then(() => console.log('Reorder OK'))
  }

  nextQuery(query: Query) {
    this.dateQuery$.next(query);
  }
}
