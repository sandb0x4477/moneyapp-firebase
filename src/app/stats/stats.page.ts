import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import { SubSink } from 'subsink';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { subMonths, addMonths } from 'date-fns';
import { map } from 'rxjs/operators';
import _round from 'lodash.round';
import _groupBy from 'lodash.groupby';
import _map from 'lodash.map';
import _sumBy from 'lodash.sumby';
import _sortBy from 'lodash.sortby';

import { CHARTCOLORS } from '../_config/chart.colors';
import { FirebaseService } from '../_services/firebase.service';
import { UtilityService } from '../_services/utility.service';
import { TransactionModel } from '../_models/transaction.model';

NoDataToDisplay(Highcharts);

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit, OnDestroy {
  chartColors = CHARTCOLORS;
  selectedDate = subMonths(new Date(), 1);
  queryFormat = 'yyyy-MM-dd';
  subs = new SubSink();

  statData: StatData[];

  constructor(public fbService: FirebaseService, private utilitySrv: UtilityService) {}

  ngOnInit() {
    this.nextQuery();
    this.subs.sink = this.fbService.transactions$
      .pipe(map(trans => trans.filter(t => t.type === 1)))
      .subscribe(res => {
        console.log('TC: StatsPage -> ngOnInit -> res', res);
        // this.transactions = res;
        this.processData(res);
      });
  }

  processData(trans: TransactionModel[]) {
    const total = _sumBy(trans, 'amount');
    const grouped = _groupBy(trans, 'mainCatId');
    const mapped = _map(grouped, (rest, mainCatId) => ({
      mainCatId,
      sum: _round(_sumBy(rest, 'amount'), 2),
      percent: _round((_sumBy(rest, 'amount') / total) * 100, 0),
      catName: rest[0].catName,
    }));

    this.statData = _sortBy(mapped, 'sum').reverse();
    this.renderPieChart(this.statData);
  }

  renderPieChart(data: StatData[]) {
    let pieChartSerie: { name: string; y: number }[] = [];
    data.forEach(item => {
      pieChartSerie.push({
        name: item.catName,
        y: item.percent,
      });
    });
    Highcharts.chart('container', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: (10 / 16) * 100 + '%',
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0],
      },
      legend: {
        itemStyle: {
          color: '#000000',
          fontWeight: 'normal',
        },
      },
      credits: {
        enabled: false,
      },
      title: {
        text: '',
      },
      tooltip: {
        pointFormat: '{series.name}: {point.percentage:.1f}%',
      },
      plotOptions: {
        pie: {
          cursor: 'pointer',
          colors: this.chartColors,
          dataLabels: {
            distance: 20,
            enabled: true,
            format: '{point.name}: {point.percentage:.0f} %',
            style: {
              fontWeight: 'normal',
              fontSize: '11px',
              fontFamily: 'RobotoCondensed',
            },
          },
        },
      },
      series: [
        {
          name: '',
          colorByPoint: true,
          data: pieChartSerie,
        },
      ] as any,
    });
  }

  goToStatsDetail(item: any) {
    console.log('TC: StatsPage -> goToStatsDetail -> item', item);
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

export interface StatData {
  mainCatId: string;
  sum: number;
  percent: number;
  catName: string;
}
