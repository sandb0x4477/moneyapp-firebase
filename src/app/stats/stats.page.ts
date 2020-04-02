import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { subMonths, addMonths, addYears, subYears } from 'date-fns';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';

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
export class StatsPage implements OnInit {
  chartColors = CHARTCOLORS;
  statsViewData$: Observable<any>;
  dateInYears = false;
  optionValue = 'month';

  constructor(public fbService: FirebaseService, public utilitySrv: UtilityService, private router: Router) {}

  ngOnInit() {
    this.nextQuery();
    this.statsViewData$ = this.fbService.transactionsStats$.pipe(
      // tap(res => console.log(res)),
      map(trans => this.processStatsData(trans)),
      tap(res => this.renderPieChart(res)),
    );
    // this.resize();
  }

  presentPopover(event: any) {}

  onSelectChange(event: any) {
    this.optionValue = event.detail.value;
    this.dateInYears = event.detail.value === 'year';
    this.nextQuery();
  }

  onNextMonth() {
    const state = this.utilitySrv.getState();
    if (this.dateInYears) {
      this.utilitySrv.setState({
        ...state,
        selectedDateStats: addYears(state.selectedDateStats, 1),
      });
    } else {
      this.utilitySrv.setState({
        ...state,
        selectedDateStats: addMonths(state.selectedDateStats, 1),
      });
    }
    this.nextQuery();
  }

  onPrevMonth() {
    const state = this.utilitySrv.getState();
    if (this.dateInYears) {
      this.utilitySrv.setState({
        ...state,
        selectedDateStats: subYears(state.selectedDateStats, 1),
      });
    } else {
      this.utilitySrv.setState({
        ...state,
        selectedDateStats: subMonths(state.selectedDateStats, 1),
      });
    }
    this.nextQuery();
  }

  processStatsData(trans: TransactionModel[]) {
    const total = _sumBy(trans, 'amount');
    const grouped = _groupBy(trans, 'mainCatId');
    const mapped = _map(grouped, (rest, mainCatId) => ({
      mainCatId,
      sum: _round(_sumBy(rest, 'amount'), 2),
      percent: _round((_sumBy(rest, 'amount') / total) * 100, 1),
      catName: rest[0].catName,
    }));

    const statData = _sortBy(mapped, 'sum').reverse();

    // console.log('TC: StatsPage -> processStatsData -> ', JSON.stringify(statData));
    return statData;
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
            softConnector: false,
            defer: true,
            connectorShape: 'fixedOffset',
            distance: 14,
            enabled: true,
            format: '{point.name}: {point.percentage:.0f} %',
            style: {
              fontWeight: 'normal',
              fontSize: '0.9em',
              fontFamily: 'RobotoCondensed',
            },
            filter: {
              property: 'percentage',
              operator: '>',
              value: 2,
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

  async goToStatsDetail(item: StatData) {
    console.log('TC: StatsPage -> goToStatsDetail -> item', item);
    await this.utilitySrv.dataTransferSet(item);
    this.router.navigate(['app/stats/detail', item.mainCatId]);
  }

  // nextDate() {
  //   this.selectedDate = addMonths(this.selectedDate, 1);
  //   this.nextQuery();
  // }

  // prevoiusDate() {
  //   this.selectedDate = subMonths(this.selectedDate, 1);
  //   this.nextQuery();
  // }

  nextQuery() {
    const { selectedDateStats } = this.utilitySrv.getState();
    this.fbService.nextQueryStats(this.utilitySrv.getQuery(selectedDateStats));
  }

  resize(event: any) {
    // if (!this.statData) {
    //   return;
    // }
    // this.renderPieChart(this.statData);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }
}

export interface StatData {
  mainCatId: string;
  sum: number;
  percent: number;
  catName: string;
}
