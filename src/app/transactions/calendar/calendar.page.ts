import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import {
  format,
  startOfWeek,
  startOfMonth,
  addDays,
  getDate,
  isToday,
  isSunday,
  isSameWeek,
  isSameMonth,
} from 'date-fns';

import { TransactionModel } from '../../_models/transaction.model';
import { UtilityService } from '../../_services/utility.service';
import { FirebaseService } from '../../_services/firebase.service';
import { TotalModel } from '../../_models/total.model';
import { map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  calendarViewData$: Observable<any>;

  weekDays = ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(public fbService: FirebaseService, private utilitySrv: UtilityService) {}

  ngOnInit() {
    this.nextQuery();
    this.calendarViewData$ = combineLatest([
      this.fbService.transactionsCalendar$,
      this.fbService.totals$,
      this.utilitySrv.selectedDateCalendar$,
    ]).pipe(
      map(([trans, totals, date]) => this.processCalendarData(trans, totals, date)),
    );
  }

  processCalendarData(trans: TransactionModel[], totals: TotalModel[], date: Date) {
    let calendarCells = [];
    const firstDay = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
    const totalForMonth = totals.find(m => m.month === format(date, 'yyyy-MM'));

    for (let i = 0; i < 42; i++) {
      let cell: any = {
        cellDay: getDate(addDays(firstDay, i)),
        cellDate: format(addDays(firstDay, i), 'yyyy-MM-dd'),
        isToday: isToday(addDays(firstDay, i)),
        isSunday: isSunday(addDays(firstDay, i)),
        isSameWeek: isSameWeek(new Date(), addDays(firstDay, i), {
          weekStartsOn: 1,
        }),
        isSameMonth: isSameMonth(date, addDays(firstDay, i)),
        expense: null,
        income: null,
      };

      const expenseForDay = trans.filter(d => d.date === cell.cellDate && d.type === 1);
      const incomeForDay = trans.filter(d => d.date === cell.cellDate && d.type === 0);

      if (expenseForDay.length > 0) {
        let expense = 0;
        expenseForDay.forEach(el => {
          expense += el.amount;
        });
        cell = { ...cell, expense };
      }

      if (incomeForDay.length > 0) {
        let income = 0;
        incomeForDay.forEach(el => {
          income += el.amount;
        });
        cell = { ...cell, income };
      }
      calendarCells.push(cell);
    }

    return { totalForMonth, calendarCells };
  }

  nextQuery() {
    const { selectedDateCalendar } = this.utilitySrv.getState();
    this.fbService.nextQueryCalendar(this.utilitySrv.getCalendarQuery(selectedDateCalendar));
  }
}
