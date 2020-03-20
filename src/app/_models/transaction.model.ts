export interface Transaction {
  accId:      string;
  accName:    string;
  amount:     number;
  catFull:    string;
  catName:    string;
  date:       string;
  deleted:    boolean;
  id?:         string;
  mainCatId:  string;
  subCatId?:   string;
  subCatName?: string;
  time:       string;
  type:       number;
}
