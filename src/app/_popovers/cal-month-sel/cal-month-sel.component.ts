import { Component, OnInit, Input } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { addYears, setMonth, subYears } from 'date-fns';

@Component({
  selector: 'app-cal-month-sel',
  templateUrl: './cal-month-sel.component.html',
  styleUrls: ['./cal-month-sel.component.scss'],
})
export class CalMonthSelComponent implements OnInit {
  @Input() selectedDate: Date;
  months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  constructor(private popoverCtrl: PopoverController, public navParams: NavParams) {}

  ngOnInit() {
    // console.log('-> ', this.navParams.get('selectedDate'));
    // this.selectedDate = this.navParams.data.selectedDate;
  }

  onNextYear() {
    this.selectedDate = addYears(this.selectedDate, 1);
  }

  onPrevYear() {
    this.selectedDate = subYears(this.selectedDate, 1);
  }

  onClose() {
    this.popoverCtrl.dismiss(this.selectedDate);
  }

  onMonthClick(i: number) {
    this.selectedDate = setMonth(this.selectedDate, i);
    console.log('-> this.selectedDate', this.selectedDate);
    this.popoverCtrl.dismiss(this.selectedDate);
  }

  onThisMonth() {
    this.selectedDate = new Date();
    this.popoverCtrl.dismiss(this.selectedDate);
  }
}
