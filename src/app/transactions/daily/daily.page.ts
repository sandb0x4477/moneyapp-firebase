import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { subMonths, addMonths } from 'date-fns';

import { FirebaseService } from '../../_services/firebase.service';

import { TransactionModel } from '../../_models/transaction.model';
import { UtilityService } from '../../_services/utility.service';
import { ModalController } from '@ionic/angular';
import { EditTransPage } from '../../_modals/edit-trans/edit-trans.page';

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
  transactions: TransactionModel[];

  constructor(
    public fbService: FirebaseService,
    private utilitySrv: UtilityService,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.nextQuery();
    this.subs.sink = this.fbService.transactions$.subscribe(res => {
      console.log('TC: DailyPage -> ngOnInit -> res', res);
      this.transactions = res;
      this.processData(res);
    });
  }

  onTransClick(trans: TransactionModel) {
    console.log('TC: DailyPage -> onTransClick -> trans', trans);
  }

  processData(transactions: TransactionModel[]) {
    const shortDatesOfMonth: string[] = this.utilitySrv.getShortDates(this.selectedDate);
    this.populateDaysCard(shortDatesOfMonth, transactions);
  }

  populateDaysCard(shortDatesOfMonth: string[], transactions: TransactionModel[]) {
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

  addNewInModal() {
    let trans: TransactionModel = {} as TransactionModel;
    const componentProps = {
      title: 'New Transaction',
      flag: 'add',
      type: 1,
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
    console.log('TC: DailyPage -> presentModal -> data', data);
  }

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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
