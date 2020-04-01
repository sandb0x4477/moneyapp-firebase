import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { TransactionModel } from '../../_models/transaction.model';

@Component({
  selector: 'app-trans-list',
  templateUrl: './trans-list.component.html',
  styleUrls: ['./trans-list.component.scss'],
})
export class TransListComponent implements OnInit {
  @Input() transactions: TransactionModel[];
  @Input() cell: any;

  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {
    console.log('TC: TransListComponent -> transactions', this.transactions);
    console.log('TC: TransListComponent -> transactions', this.cell);
  }

  onTransClick(trans: TransactionModel) {
    console.log('TC: TransListComponent -> onTransClick -> trans', trans);
    const payload = {
      type: 'edit',
      item: trans
    }
    this.popoverCtrl.dismiss(payload);
  }

  addNewTransaction() {
    const payload = {
      type: 'new',
      date: new Date(this.cell.cellDate)
    }
    this.popoverCtrl.dismiss(payload);
  }
}
