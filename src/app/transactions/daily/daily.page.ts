import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SubSink } from 'subsink';
import { subMonths, addMonths, format } from 'date-fns';

import { FirebaseService } from '../../_services/firebase.service';

import { TransactionModel } from '../../_models/transaction.model';
import { UtilityService } from '../../_services/utility.service';
import { ModalController } from '@ionic/angular';
import { EditTransPage } from '../../_modals/edit-trans/edit-trans.page';
import { TotalModel } from '../../_models/total.model';

@Component({
  selector: 'app-daily',
  templateUrl: './daily.page.html',
  styleUrls: ['./daily.page.scss'],
})
export class DailyPage implements OnInit, OnDestroy, AfterViewInit {
  ngAfterViewInit(): void {
  // console.log('TC: DailyPage -> ngAfterViewInit');
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  subs = new SubSink();

  dailyData: any[] = [];
  totals: TotalModel[] = [];

  totalIncome = 0;
  totalExpense = 0;

  // selectedDate = subMonths(new Date(), 10);
  selectedDate = new Date();
  transactions: TransactionModel[];

  constructor(
    public fbService: FirebaseService,
    private utilitySrv: UtilityService,
    private modalCtrl: ModalController,
  ) {
  }

  // ngOnInit() {}

  ngOnInit() {
    this.setUpListeners();
    this.nextQuery();
  }

  ionViewWillEnter() {
    this.nextQuery();
  }

  ionViewWillUnload() {
  // console.log('TC: DailyPage -> ionViewWillUnload -> ionViewWillUnload');

  }

  ionViewDidLeave() {
    // console.log('TC: DailyPage -> ionViewDidLeave -> ionViewDidLeave');
    this.subs.unsubscribe();
  }

  setUpListeners() {
    this.subs.sink = this.fbService.transactionsDaily$.subscribe(res => {
      // console.log('TC: DailyPage -> ngOnInit -> res', res);
      this.transactions = res;
      this.processData(res);
    });
    this.subs.sink = this.fbService.totals$.subscribe(res => {
      // console.log('TC: DailyPage -> TOTALS -> ', res);
      this.totals = res;
    });
    this.subs.sink = this.utilitySrv.dateStore$.subscribe(res => {
      const { selectedDate } = res;
      this.selectedDate = selectedDate;
      this.nextQuery();
    });
  }

  onTransClick(trans: TransactionModel) {
    // console.log('TC: DailyPage -> onTransClick -> trans', trans);
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
      // // console.log('TC: DailyPage -> populateCards -> el', el);
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
    // console.log('TC: DailyPage -> presentModal -> data', data);
    if (data) {
      this.fbService.addTransaction(data.trans);
    }
  }

  get totalForCurrentMonth() {
    return this.totals.find(t => t.month === format(this.selectedDate, 'yyyy-MM'));
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
    this.fbService.nextQueryDaily(this.utilitySrv.getQuery(this.selectedDate));
  }
}
