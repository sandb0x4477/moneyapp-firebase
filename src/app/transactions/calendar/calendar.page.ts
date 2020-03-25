import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { subMonths, addMonths, format, startOfWeek, startOfMonth, addDays, getDate, isToday, isSunday, isSameWeek, isSameMonth } from 'date-fns';

import { TransactionModel } from '../../_models/transaction.model';
import { UtilityService } from '../../_services/utility.service';
import { FirebaseService } from '../../_services/firebase.service';
import { TotalModel } from '../../_models/total.model';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit, OnDestroy {
  subs = new SubSink();

  calendarData: any[] = [];
  weekDays = ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'];

  selectedDate = subMonths(new Date(), 6);
  transactions: TransactionModel[];
  totals: TotalModel[] = [];

  constructor(public fbService: FirebaseService, private utilitySrv: UtilityService) {}

  ngOnInit() {
    this.nextQuery();
    this.subs.sink = this.fbService.transactions$.subscribe(res => {
      console.log('TC: CalendarPage -> ngOnInit -> res', res);
      this.transactions = res;
      this.calendarData = this.getCalendarDays(res);
      console.log('TC: CalendarPage -> ngOnInit -> this.calendarData', this.calendarData);
    });
    this.subs.sink = this.fbService.totals$.subscribe(res => {
      console.log('TC: CalendarPage -> ngOnInit -> res', res);
      this.totals = res;
    });``
  }

  getCalendarDays(trans: TransactionModel[]) {
    let calendarCells = [];
    const firstDay = startOfWeek(startOfMonth(this.selectedDate), {weekStartsOn: 1});
    for (let i = 0; i < 42; i++) {
      let cell: any = {
        cellDay: getDate(addDays(firstDay, i)),
        cellDate: format(addDays(firstDay, i), 'yyyy-MM-dd'),
        isToday: isToday(addDays(firstDay, i)),
        isSunday: isSunday(addDays(firstDay, i)),
        isSameWeek: isSameWeek(new Date(), addDays(firstDay, i), {
          weekStartsOn: 1,
        }),
        isSameMonth: isSameMonth(this.selectedDate, addDays(firstDay, i)),
        expense: null,
        income: null,
      }

      const expenseIdx = trans.findIndex(d => d.date === cell.cellDate && d.type === 1);
      const incomeIdx = trans.findIndex(d => d.date === cell.cellDate && d.type === 0);

      if (expenseIdx !== -1) {
        cell = { ...cell, expense: trans[expenseIdx].amount };
      }

      if (incomeIdx !== -1) {
        cell = { ...cell, income: trans[incomeIdx].amount };
      }

      calendarCells.push(cell);
    }

    return calendarCells;
  }

  nextDate() {
    this.selectedDate = addMonths(this.selectedDate, 1);
    this.nextQuery();
  }

  prevoiusDate() {
    this.selectedDate = subMonths(this.selectedDate, 1);
    this.nextQuery();
  }

  get totalForCurrentMonth() {
    return this.totals.find(t => t.month === format(this.selectedDate, 'yyyy-MM')) || null;
  }

  nextQuery() {
    this.fbService.nextQuery(this.utilitySrv.getCalendarQuery(this.selectedDate));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
