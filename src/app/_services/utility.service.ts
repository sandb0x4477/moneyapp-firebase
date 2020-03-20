import { Injectable } from '@angular/core';
import {
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  addYears,
  addMonths,
  subYears,
  subMonths,
  eachDayOfInterval,
} from 'date-fns';
import { Transaction } from '../_models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  queryFormat = 'yyyy-MM-dd';
  constructor() { }

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
    console.log('TC: UtilityService -> getQuery -> query', query);
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

  getDayHeader(day: Transaction[]) {
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
}
