import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseService } from '../../_services/firebase.service';
import { RepeatModel } from '../../_models/repeat.model';
import { REPEAT_TYPES } from '../../_config/repeat.types';
import { ModalController } from '@ionic/angular';
import { EditTransPage } from '../../_modals/edit-trans/edit-trans.page';

@Component({
  selector: 'app-repeat',
  templateUrl: './repeat.page.html',
  styleUrls: ['./repeat.page.scss'],
})
export class RepeatPage implements OnInit {
  repeatTrans$: Observable<RepeatModel[]>;
  repeatTypes = REPEAT_TYPES;

  constructor(private fbService: FirebaseService, private modalCtrl: ModalController) {
  }

  ngOnInit() {
    this.repeatTrans$ = this.fbService.repeat$;
  }

  addNewInModal() {
    const trans: RepeatModel = {} as RepeatModel;
    const componentProps = {
      title: 'New Transaction',
      flag: 'repeat',
      type: 1,
      trans,
    };
    this.presentModal(componentProps, EditTransPage);
  }

  onEdit(trans: RepeatModel) {
    console.log('TC: RepeatPage -> onEdit -> trans', trans);

  }

  async presentModal(componentProps: any, component: any) {
    const modal = await this.modalCtrl.create({
      component,
      componentProps,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    console.log('TC: DailyPage -> PRESENTMODAL -> data', data);
    // if (data) {
    //   if (data.flag === 'add') {
    //     this.fbService.addTransaction(data.trans);
    //   } else if (data.flag === 'edit') {
    //     this.fbService.updateTransaction(data.trans);
    //   } else if (data.flag === 'delete') {
    //     this.fbService.deleteTransaction(data.trans);
    //   }
    // }
  }

  getRepeatType(type: number) {
    return this.repeatTypes.find(x => x.value === type).name;
  }
}
