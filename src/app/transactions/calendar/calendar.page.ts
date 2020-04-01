import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
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
import { map, tap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';

import { TransactionModel } from '../../_models/transaction.model';
import { UtilityService } from '../../_services/utility.service';
import { FirebaseService } from '../../_services/firebase.service';
import { TotalModel } from '../../_models/total.model';
import { EditTransPage } from '../../_modals/edit-trans/edit-trans.page';
import { TransListComponent } from '../../_popovers/trans-list/trans-list.component';
import { dateFormat } from 'highcharts';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  calendarViewData$: Observable<any>;
  transactions: TransactionModel[];

  weekDays = ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(
    public fbService: FirebaseService,
    private utilitySrv: UtilityService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
  ) {}

  ngOnInit() {
    this.nextQuery();
    this.calendarViewData$ = combineLatest([
      this.fbService.transactionsCalendar$,
      this.fbService.totals$,
      this.utilitySrv.selectedDateCalendar$,
    ]).pipe(
      tap(([trans, ,]) => {
        this.transactions = trans;
        console.log('TC: CalendarPage -> ngOnInit -> this.transactions', this.transactions);
      }),

      map(([trans, totals, date]) => this.processCalendarData(trans, totals, date)),
    );
  }

  onTransClick(trans: TransactionModel) {
    console.log('TC: CalendarPage -> onTransClick -> trans', trans);
    const componentProps = {
      title: 'Edit Transaction',
      flag: 'edit',
      type: trans.type,
      selectedDate: new Date(trans.date),
      trans,
    };
    this.presentModal(componentProps, EditTransPage);
  }

  addNewInModal(date: Date = new Date()) {
    let trans: TransactionModel = {} as TransactionModel;
    const componentProps = {
      title: 'New Transaction',
      flag: 'add',
      type: 1,
      selectedDate: date,
      trans,
    };
    this.presentModal(componentProps, EditTransPage);
  }

  async presentModal(componentProps: any, component: any) {
    const modal = await this.modalCtrl.create({
      component,
      componentProps,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    console.log('TC: CALENDAR -> PRESENTMODAL -> data', data);
    if (data) {
      if (data.flag === 'add') {
        this.fbService.addTransaction(data.trans);
      } else if (data.flag === 'edit') {
        this.fbService.updateTransaction(data.trans);
      } else if (data.flag === 'delete') {
        this.fbService.deleteTransaction(data.trans);
      }
    }
  }

  async onCalendarCell(cell: any) {
    console.log('TC: CalendarPage -> onCalendarCell -> cell', cell);
    const transactions = this.transactions.filter(t => t.date === cell.cellDate);
    console.log('TC: CalendarPage -> onCalendarCell -> dayTrans', transactions);
    const cellData = {
      ...cell,
      dayDate: new Date(cell.cellDate),
    };

    const popover = await this.popoverCtrl.create({
      component: TransListComponent,
      // event,
      componentProps: {
        transactions,
        cell,
      },
      cssClass: 'trans-list-popup',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();
    if (data) {
      console.log('TC: openTransList -> data', data);
      if (data.type === 'new') {
        console.log('TC: openTransList -> data', data);
        this.addNewInModal(data.date);
      } else {
        this.onTransClick(data.item);
      }
    }
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
