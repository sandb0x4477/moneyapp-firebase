import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { filter, tap } from 'rxjs/operators';

import { FirebaseService } from '../../_services/firebase.service';
import { TotalModel } from '../../_models/total.model';

@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
})
export class MonthlyPage implements OnInit, OnDestroy {
  subs = new SubSink();
  selectedYear = '2019';
  totals: TotalModel[];
  totalsRes: TotalModel[];

  totalIncome: number;
  totalExpense: number;

  constructor(public fbService: FirebaseService) {}

  ngOnInit() {
    this.subs.sink = this.fbService.totals$.subscribe(res => {
      this.totalsRes = res;
      this.calculateTotals();
    });
  }

  calculateTotals() {
    this.totals = this.totalsRes.filter(r => r.month.substring(0, 4) === this.selectedYear).reverse();
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.totals.forEach(item => {
      this.totalIncome += item.income;
      this.totalExpense += item.expense;
    });
  }

  changeYear() {
    this.selectedYear = this.selectedYear === '2019' ? '2020' : '2019';
    this.calculateTotals();
    console.log('TC: MonthlyPage -> changeYear -> this.selectedYear', this.selectedYear);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
