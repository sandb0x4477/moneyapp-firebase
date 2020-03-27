import { Component, Input, OnInit } from '@angular/core';
import {
  addDays,
  addMonths,
  format,
  getDate,
  isSameMonth,
  isSunday,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-date-picker-popup',
  templateUrl: './date-picker-popup.component.html',
  styleUrls: ['./date-picker-popup.component.scss'],
})
export class DatePickerPopupComponent implements OnInit {
  @Input() selectedDate = new Date();
  weekStartsOn: any = 1;
  daycells: any[] = [];
  weekDays: string[] = [];

  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {
    this.populateCellDays();
    this.populateWeekDays();
  }

  populateWeekDays() {
    const startDate = startOfWeek(this.selectedDate, { weekStartsOn: this.weekStartsOn });
    for (let i = 0; i < 7; i++) {
      this.weekDays.push(format(addDays(startDate, i), 'EEE'));
    }
  }

  populateCellDays() {
    this.daycells = [];
    const firstDay = startOfWeek(startOfMonth(this.selectedDate), { weekStartsOn: this.weekStartsOn });
    for (let i = 0; i < 42; i++) {
      const day: any = {
        cellDay: getDate(addDays(firstDay, i)),
        cellDate: format(addDays(firstDay, i), 'yyyy-MM-dd'),
        isToday: isToday(addDays(firstDay, i)),
        isSunday: isSunday(addDays(firstDay, i)),
        isSameMonth: isSameMonth(this.selectedDate, addDays(firstDay, i)),
      } as any;
      this.daycells.push(day);
    }
  }

  onPrevMonth() {
    this.selectedDate = subMonths(this.selectedDate, 1);
    this.populateCellDays();
  }

  onNextMonth() {
    this.selectedDate = addMonths(this.selectedDate, 1);
    this.populateCellDays();
  }

  onDayClick(day: any) {
    this.selectedDate = parse(day.cellDate, 'yyyy-MM-dd', new Date());
    // this.populateCellDays();
    this.popoverCtrl.dismiss({ selectedDate: this.selectedDate });
  }
}
