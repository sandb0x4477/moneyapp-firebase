import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FirebaseService } from '../../_services/firebase.service';
import { TotalModel } from '../../_models/total.model';
import { UtilityService } from '../../_services/utility.service';

@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
})
export class MonthlyPage implements OnInit {

  monthlyViewData$: Observable<any>;

  constructor(public fbService: FirebaseService, private utilitySrv: UtilityService) {}

  ngOnInit() {
    this.monthlyViewData$ = combineLatest([this.utilitySrv.selectedYear$, this.fbService.totals$]).pipe(
      map(([selectedYear, totals]) => this.processData(selectedYear, totals))
    );
  }

  processData(selectedYear: Date, totals: TotalModel[] ) {
    const yearlyData = totals.filter(r => r.month.substring(0, 4) === format(selectedYear, 'yyyy')).reverse();
    let income = 0;
    let expense = 0;
    yearlyData.forEach(el => {
      income += el.income;
      expense += el.expense;
    })

    const payload = {
      yearlyData,
      income,
      expense
    }
    return payload;
  }
}
