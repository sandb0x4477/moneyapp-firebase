import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-daily-trans',
  templateUrl: './daily-trans.component.html',
  styleUrls: ['./daily-trans.component.scss'],
})
export class DailyTransComponent implements OnInit {
  @Input() day: any;
  @Output() command: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  ngOnInit() {}

  onTransClick(trans: any) {
    this.command.emit(trans);
  }
}
