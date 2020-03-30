import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';

import { FirebaseService } from '../../_services/firebase.service';
import { TransactionModel } from '../../_models/transaction.model';
import { UtilityService } from '../../_services/utility.service';
import { ModalController } from '@ionic/angular';
import { EditTransPage } from '../../_modals/edit-trans/edit-trans.page';
import { TotalModel } from '../../_models/total.model';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-daily',
  templateUrl: './daily.page.html',
  styleUrls: ['./daily.page.scss'],
})
export class DailyPage implements OnInit {
  dailyViewData$: Observable<any>;

  constructor(
    public fbService: FirebaseService,
    private utilitySrv: UtilityService,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.nextQuery();
    this.dailyViewData$ = combineLatest([
      this.fbService.transactionsDaily$,
      this.fbService.totals$,
      this.utilitySrv.selectedDate$,
    ]).pipe(
      // tap(res => {
      //   console.log(res);
      // }),
      map(([trans, totals, date]) => this.processDailyData(trans, totals, date)),
    );
  }

  processDailyData(trans: TransactionModel[], totals: TotalModel[], date: Date) {
    let dailyData = [];
    const shortDatesOfMonth: string[] = this.utilitySrv.getShortDates(date);
    const totalForMonth = totals.find(m => m.month === format(date, 'yyyy-MM'));

    shortDatesOfMonth.forEach(el => {
      const result = trans.filter(t => t.date === el);
      if (result.length > 0) {
        const data = this.utilitySrv.getDayHeader(result);
        dailyData.push({ header: data.payload, result });
      }
    });

    return {
      dailyData,
      totalForMonth,
    };
  }

  onTransClick(trans: TransactionModel) {
    console.log('TC: DailyPage -> onTransClick -> trans', trans);
    const componentProps = {
      title: 'Edit Transaction',
      flag: 'edit',
      type: trans.type,
      selectedDate: new Date(trans.date),
      trans,
    };
    this.presentModal(componentProps, EditTransPage);
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
    console.log('TC: DailyPage -> PRESENTMODAL -> data', data);
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

  nextQuery() {
    const { selectedDate } = this.utilitySrv.getState();
    this.fbService.nextQueryDaily(this.utilitySrv.getQuery(selectedDate));
  }
}
