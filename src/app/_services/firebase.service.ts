import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable, BehaviorSubject, of } from 'rxjs';

import { Total } from '../_models/total.model';
import { Transaction } from '../_models/transaction.model';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

interface Query {
  start: string;
  end: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  dateQuery$: BehaviorSubject<Query | null>;
  transaction$: Observable<Transaction[]>;
  totals$: Observable<Total[]>;
  startDate = '2019-01-01';
  endDate = '2019-01-31';

  constructor(private db: AngularFireDatabase) {
    this.dateQuery$ = new BehaviorSubject(null);

    this.totals$ = db
      .list<Total>('totals', ref => ref.orderByKey())
      .valueChanges();

    this.transaction$ = this.dateQuery$.pipe(
      switchMap(query =>
        query
          ? db
              .list<Transaction>('transaction', ref =>
                ref
                  .orderByChild('date')
                  .startAt(query.start)
                  .endAt(query.end),
              )
              .valueChanges()
          : of([]),
      ),
    );
  }

  nextQuery(query: Query) {
    this.dateQuery$.next(query);
  }
}
