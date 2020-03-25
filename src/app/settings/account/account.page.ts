import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SubSink } from 'subsink';
import { map } from 'rxjs/operators';

import { AccountModel } from '../../_models/account.model';
import { FirebaseService } from '../../_services/firebase.service';
import { EditAccCatPage } from '../../_modals/edit-acc-cat/edit-acc-cat.page';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit, OnDestroy {
  subs = new SubSink();
  accounts: AccountModel[];

  constructor(public fbService: FirebaseService, private modalCtrl: ModalController) {}

  ngOnInit() {
    this.subs.sink = this.fbService.accounts$
      .pipe(map(acc => acc.filter(a => a.isDeleted === false)))
      .subscribe(res => {
        this.accounts = res;
      });
  }

  editInModal(item: AccountModel) {
    console.log('TC: AccountPage -> editInModal -> item', item);
    const componentProps = {
      title: 'Edit Account',
      flag: 'edit',
      type: 'account',
      name: item.accName,
      id: item.id,
    };
    this.presentModal(componentProps, EditAccCatPage);
  }

  addNewInModal() {
    const componentProps = {
      title: 'Add Account',
      flag: 'add',
      type: 'account',
      name: '',
    };
    this.presentModal(componentProps, EditAccCatPage);
  }

  async presentModal(componentProps: any, component: any) {
    const modal = await this.modalCtrl.create({
      component,
      componentProps,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (!data) {
      return;
    }

    if (data.flag === 'add') {
      const payload: AccountModel = {
        accName: data.name,
        isDeleted: false,
      };
      await this.fbService.addAccount(payload);
    }

    if (data.flag === 'edit') {
      const payload: Partial<AccountModel> = {
        id: data.id,
        accName: data.name,
      };
      await this.fbService.updateAccount(payload);
    }

    if (data.flag === 'delete') {
      const payload = {
        id: data.id,
        isDeleted: true
      }
      this.fbService.updateAccount(payload);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
