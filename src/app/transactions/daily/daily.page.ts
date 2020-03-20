import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { subMonths, addMonths } from 'date-fns';

import { FirebaseService } from '../../_services/firebase.service';

import { Transaction } from '../../_models/transaction.model';
import { UtilityService } from '../../_services/utility.service';

@Component({
  selector: 'app-daily',
  templateUrl: './daily.page.html',
  styleUrls: ['./daily.page.scss'],
})
export class DailyPage implements OnInit, OnDestroy {
  subs = new SubSink();

  dailyData: any[] = [];

  totalIncome = 0;
  totalExpense = 0;

  selectedDate = subMonths(new Date(), 10);
  transactions: Transaction[];

  constructor(public fbService: FirebaseService, private utilitySrv: UtilityService) {}

  ngOnInit() {
    this.nextQuery();
    this.subs.sink = this.fbService.transaction$.subscribe(res => {
      console.log('TC: DailyPage -> ngOnInit -> res', res);
      this.transactions = res;
      this.processData(res);
    });
  }

  onTransClick(trans: Transaction) {
    console.log('TC: DailyPage -> onTransClick -> trans', trans);
  }

  processData(transactions: Transaction[]) {
    const shortDatesOfMonth: string[] = this.utilitySrv.getShortDates(this.selectedDate);
    this.populateDaysCard(shortDatesOfMonth, transactions);
  }

  populateDaysCard(shortDatesOfMonth: string[], transactions: Transaction[]) {
    this.dailyData = [];
    this.totalIncome = 0;
    this.totalExpense = 0;
    shortDatesOfMonth.forEach(el => {
      // console.log('TC: DailyPage -> populateCards -> el', el);
      const result = transactions.filter(t => t.date === el);
      if (result.length > 0) {
        const data = this.utilitySrv.getDayHeader(result);
        this.totalExpense += data.expense;
        this.totalIncome += data.income;
        this.dailyData.push({ header: data.payload, result });
      }
    });
  }

  addNewInModal() {}

  nextDate() {
    this.selectedDate = addMonths(this.selectedDate, 1);
    this.nextQuery();
  }

  prevoiusDate() {
    this.selectedDate = subMonths(this.selectedDate, 1);
    this.nextQuery();
  }

  nextQuery() {
    this.fbService.nextQuery(this.utilitySrv.getQuery(this.selectedDate));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
