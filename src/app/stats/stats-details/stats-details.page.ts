import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import * as Highcharts from 'highcharts';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { subMonths, addMonths } from 'date-fns';
import { map } from 'rxjs/operators';

import { FirebaseService } from '../../_services/firebase.service';
import { UtilityService } from '../../_services/utility.service';
import { StatData } from '../stats.page';

NoDataToDisplay(Highcharts);

@Component({
  selector: 'app-stats-details',
  templateUrl: './stats-details.page.html',
  styleUrls: ['./stats-details.page.scss'],
})
export class StatsDetailsPage implements OnInit {
  subs = new SubSink();
  mainCategory: StatData;
  selectedDate = subMonths(new Date(), 1);
  queryFormat = 'yyyy-MM-dd';

  constructor(public fbService: FirebaseService, private utilitySrv: UtilityService) {}

  ionViewDidEnter() {
    this.resize();
  }

  async ngOnInit() {
    // this.mainCategory = await this.utilitySrv.dataTransferGet();
    // // this.nextQuery();

    // this.subs.sink = this.fbService.transactions$
    //   .pipe(map(trans => trans.filter(t => t.type === 1 && t.mainCatId === this.mainCategory.mainCatId)))
    //   .subscribe(res => {
    //     console.log('TC: StatsPage -> ngOnInit -> res', res);
    //     // this.transactions = res;
    //     // this.processData(res);
    //   });
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

  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }
}
