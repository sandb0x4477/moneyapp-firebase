import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { addYears, addMonths, subYears, subMonths } from 'date-fns';
import { SubSink } from 'subsink';

import { CalMonthSelComponent } from '../_popovers/cal-month-sel/cal-month-sel.component';
import { UtilityService } from '../_services/utility.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit, OnDestroy {
  subs = new SubSink();

  dateInYears = false;
  selectedDate: Date;
  selectedYear: Date;
  menuValue = 'daily';

  constructor(
    private utilitySrv: UtilityService,
    private popoverCtrl: PopoverController,
    private router: Router,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    this.navCtrl.navigateRoot(['app/transactions/daily'], { animationDirection: 'forward' });
    this.subs.sink = this.utilitySrv.dateStore$.subscribe(res => {
      const { selectedDate, selectedYear } = res;
      this.selectedYear = selectedYear;
      this.selectedDate = selectedDate;
    });
  }

  ngOnDestroy() {
    // console.log('TC: TransactionsPage -> ngOnDestroy');
    this.subs.unsubscribe();
  }

  menuChanged(event: any) {
    this.navCtrl
      .navigateRoot(['app/transactions/', event.detail.value], { animationDirection: 'forward' })
      .then(() => {
        this.menuValue = event.detail.value;
        this.dateInYears = event.detail.value === 'monthly';
      })
      .catch(err => console.log(err));
  }

  async presentPopover(event: any) {
    const popover = await this.popoverCtrl.create({
      component: CalMonthSelComponent,
      event,
      componentProps: {
        selectedDate: this.selectedDate,
      },
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data) {
      const state = this.utilitySrv.getState();
      this.utilitySrv.setState({
        ...state,
        selectedDate: data,
      });
    }
  }

  onNext() {
    const state = this.utilitySrv.getState();
    console.log('TC: TransactionsPage -> onNext -> state', state);
    if (this.dateInYears) {
      this.utilitySrv.setState({
        ...state,
        selectedYear: addYears(this.selectedYear, 1),
      });
    } else {
      this.utilitySrv.setState({
        ...state,
        selectedDate: addMonths(this.selectedDate, 1),
      });
    }
  }

  onPrev() {
    const state = this.utilitySrv.getState();
    console.log('TC: TransactionsPage -> onNext -> state', state);
    if (this.dateInYears) {
      this.utilitySrv.setState({
        ...state,
        selectedYear: subYears(this.selectedYear, 1),
      });
    } else {
      this.utilitySrv.setState({
        ...state,
        selectedDate: subMonths(this.selectedDate, 1),
      });
    }
  }
}
