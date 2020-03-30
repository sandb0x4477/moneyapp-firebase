import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import {
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachDayOfInterval,
  addDays,
  startOfWeek,
} from 'date-fns';

import { TransactionModel } from '../_models/transaction.model';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  initialState = {
    selectedDate: new Date(),
    selectedDateCalendar: new Date(),
    selectedDateStats: new Date(),
    selectedYear: new Date(),
  };

  private dateStore = new BehaviorSubject<{
    selectedDate: Date;
    selectedDateCalendar: Date;
    selectedDateStats: Date;
    selectedYear: Date;
  }>(this.initialState);
  public readonly dateStore$ = this.dateStore.asObservable();

  queryFormat = 'yyyy-MM-dd';

  constructor() {}

  get selectedDateCalendar$() {
    return this.dateStore$.pipe(map(s => s.selectedDateCalendar));
  }

  get selectedDate$() {
    return this.dateStore$.pipe(map(s => s.selectedDate));
  }

  get selectedDateStats$() {
    return this.dateStore$.pipe(map(s => s.selectedDateStats));
  }

  get selectedYear$() {
    return this.dateStore$.pipe(map(s => s.selectedYear));
  }

  getState() {
    return this.dateStore.getValue();
  }

  setState(next: any) {
    this.dateStore.next(next);
  }

  getQuery(selectedDate: Date, dateInYears: boolean = false, catlastEight: boolean = false) {
    let query: any = {};
    if (dateInYears) {
      query.start = format(startOfYear(selectedDate), this.queryFormat);
      query.end = format(endOfYear(selectedDate), this.queryFormat);
    } else if (catlastEight) {
      query.start = format(subMonths(startOfMonth(selectedDate), 11), this.queryFormat);
      query.end = format(endOfMonth(selectedDate), this.queryFormat);
    } else {
      query.start = format(startOfMonth(selectedDate), this.queryFormat);
      query.end = format(endOfMonth(selectedDate), this.queryFormat);
    }
    // console.log('TC: UtilityService -> getQuery -> query', query);
    return query;
  }

  getCalendarQuery(selectedDate: Date) {
    const firstDay = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 });
    const query = {
      start: format(firstDay, this.queryFormat),
      end: format(addDays(firstDay, 41), this.queryFormat),
    };
    return query;
  }

  getShortDates(selectedDate: Date, dateInYears: boolean = false): string[] {
    let shortDates: string[] = [];
    if (dateInYears) {
      shortDates = eachDayOfInterval({
        start: startOfYear(selectedDate),
        end: endOfYear(selectedDate),
      })
        .map(item => format(item, this.queryFormat))
        .reverse();
    } else {
      shortDates = eachDayOfInterval({
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
      })
        .map(item => format(item, this.queryFormat))
        .reverse();
    }
    return shortDates;
  }

  getDayHeader(day: TransactionModel[]) {
    let income = 0;
    let expense = 0;
    let dayOfTheMonth: string;
    let monthYear: string;
    let weekDay: string;
    day.forEach(item => {
      if (item.type === 0) {
        income += item.amount;
      } else {
        expense += item.amount;
      }
    });
    dayOfTheMonth = format(new Date(day[0].date), 'dd');
    monthYear = format(new Date(day[0].date), 'yyyy.MM');
    weekDay = format(new Date(day[0].date), 'EEEE');
    const payload = {
      income,
      expense,
      dayOfTheMonth,
      monthYear,
      weekDay,
    };
    return { payload, expense, income };
  }

  async dataTransferSet(data: any) {
    await Storage.set({
      key: 'transfer',
      value: JSON.stringify(data),
    });
  }

  async dataTransferGet() {
    const ret = await Storage.get({ key: 'transfer' });
    return JSON.parse(ret.value);
  }
}
