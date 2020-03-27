import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import _ceil from 'lodash.ceil';

@Component({
  selector: 'app-calculator-popup',
  templateUrl: './calculator-popup.component.html',
  styleUrls: ['./calculator-popup.component.scss'],
})
export class CalculatorPopupComponent implements OnInit {
  currentNumber = '0';
  firstOperand = null;
  operator = null;
  waitForSecondNumber = false;
  selectedAmount: number;

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {}

  public getNumber(v: string) {
    // console.log(v);
    if (this.waitForSecondNumber) {
      this.currentNumber = v;
      this.waitForSecondNumber = false;
    } else {
      this.currentNumber === '0' ? (this.currentNumber = v) : (this.currentNumber += v);
    }
  }

  getDecimal() {
    if (!this.currentNumber.includes('.')) {
      this.currentNumber += '.';
    }
  }

  private doCalculation(op, secondOp) {
    switch (op) {
      case '+':
        return (this.firstOperand += secondOp);
      case '-':
        return (this.firstOperand -= secondOp);
      case '*':
        return (this.firstOperand *= secondOp);
      case '/':
        return (this.firstOperand /= secondOp);
      case '=':
        return secondOp;
    }
  }

  public getOperation(op: string) {
    // console.log(op);

    if (this.firstOperand === null) {
      this.firstOperand = Number(this.currentNumber);
      if (op === '=') {
        this.popoverCtrl.dismiss(this.firstOperand);
      }
    } else if (this.operator) {
      const result = this.doCalculation(this.operator, Number(this.currentNumber));
      this.currentNumber = String(_ceil(result, 2));

      console.log('TC: CalculatorPage -> getOperation -> this.currentNumber', this.currentNumber);
      this.firstOperand = result;
      this.popoverCtrl.dismiss(result);
    }
    this.operator = op;
    this.waitForSecondNumber = true;

    // console.log(this.firstOperand);
  }

  public clear() {
    this.currentNumber = '0';
    this.firstOperand = null;
    this.operator = null;
    this.waitForSecondNumber = false;
  }
}
