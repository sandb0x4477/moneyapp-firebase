import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { format } from 'date-fns';
import { combineLatest, Observable } from 'rxjs';

import { FirebaseService } from '../../_services/firebase.service';
import { TotalModel } from '../../_models/total.model';
import { UtilityService } from '../../_services/utility.service';

@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
})
export class MonthlyPage implements OnInit, OnDestroy {
  subs = new SubSink();

  totals: TotalModel[];

  totalIncome: number;
  totalExpense: number;

  latest: Observable<any>;

  constructor(public fbService: FirebaseService, private utilitySrv: UtilityService) {}

  ngOnInit() {
    this.latest = combineLatest([this.utilitySrv.selectedYear$, this.fbService.totals$]);
    this.subs.sink = this.latest.subscribe(([selectedYear, totals]) => {
      // console.log('TC: MonthlyPage -> ngOnInit -> totals', totals);
      // console.log('TC: MonthlyPage -> ngOnInit -> selectedYear', selectedYear);
      this.calculateTotals(totals, selectedYear);
    });
  }

  ngOnDestroy() {
    console.log('TC: MonthlyPage -> ngOnDestroy');
    this.subs.unsubscribe();
  }

  calculateTotals(totals: TotalModel[], selectedYear: Date) {
    this.totals = totals.filter(r => r.month.substring(0, 4) === format(selectedYear, 'yyyy')).reverse();
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.totals.forEach(item => {
      this.totalIncome += item.income;
      this.totalExpense += item.expense;
    });
  }
}
