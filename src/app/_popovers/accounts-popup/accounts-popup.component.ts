import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { AccountModel } from '../../_models/account.model';

@Component({
  selector: 'app-accounts-popup',
  templateUrl: './accounts-popup.component.html',
  styleUrls: ['./accounts-popup.component.scss'],
})
export class AccountsPopupComponent implements OnInit {
  @Input() accounts: AccountModel[];

  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {}

  onSelectAccount(item: AccountModel) {
    console.log('TC: AccountsPopupComponent -> onSelectAccount -> item', item);
    this.popoverCtrl.dismiss(item);
  }
}
