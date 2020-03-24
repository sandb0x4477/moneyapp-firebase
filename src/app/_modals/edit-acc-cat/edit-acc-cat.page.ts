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

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  onSubmit() {
    const data = {
      name: this.name,
      flag: this.flag,
      type: this.type,
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
