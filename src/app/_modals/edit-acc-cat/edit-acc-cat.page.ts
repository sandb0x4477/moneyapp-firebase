import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-acc-cat',
  templateUrl: './edit-acc-cat.page.html',
  styleUrls: ['./edit-acc-cat.page.scss'],
})
export class EditAccCatPage implements OnInit {
  @Input() title: string;
  @Input() flag: string;
  @Input() type: string;
  @Input() name: string | null;
  @Input() id: string | null;
  @Input() incomeExpense: string = 'Expense';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  onSubmit() {
    const data = {
      name: this.name,
      flag: this.flag,
      type: this.type,
      id: this.id || null,
      incomeExpense: this.incomeExpense || null,
    };
    this.dismissModal(data);
  }

  delete() {
    const data = {
      name: this.name,
      flag: 'delete',
      type: this.type,
      id: this.id || null,
    };
    this.dismissModal(data);
  }

  submitDisabled() {
    return this.name.length < 3;
  }

  async dismissModal(data: any = null) {
    await this.modalCtrl.dismiss(data);
  }
}
