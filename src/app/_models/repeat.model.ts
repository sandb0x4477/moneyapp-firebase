import { TransactionModel } from './transaction.model';

export interface RepeatModel extends TransactionModel {
  nextDate: string;
  repeatType: number;
  monthNext: string;
}
