import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { format, getUnixTime, fromUnixTime, parseISO } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Category {
  id: number;
  is_deleted: boolean;
  category_name: string;
  trans_type: number;
  order_seq: number;
  uid: string;
}

interface SubCategory {
  id: number;
  is_deleted: boolean;
  sub_category_name: string;
  trans_type: number;
  order_seq: number;
  main_category_id: number;
  uid: string;
}

interface Account {
  id: number;
  account_name: string;
  account_type: number;
  is_deleted: boolean;
  order_seq: number;
}
const ACCOUNTS = [
  {
    accountName: 'Cash',
    fbId: '-M2elScw9NSp8sxomCS6',
    id: 1,
    isDeleted: false,
    orderSeq: 1,
  },
  {
    accountName: 'CommBank',
    fbId: '-M2elSctDcg2EfxVb4FQ',
    id: 5,
    isDeleted: false,
    orderSeq: 2,
  },
  {
    accountName: 'Visa CC',
    fbId: '-M2elScv2kNQGvn3YU7p',
    id: 6,
    isDeleted: false,
    orderSeq: 3,
  },
];

const CATEGORIES = [
  {
    categoryName: 'Food',
    fbId: '-M2eltVFR8T426T5Egmh',
    id: 6,
    isDeleted: false,
    orderSeq: 101,
    transType: 1,
  },
  {
    categoryName: 'Household',
    fbId: '-M2eltVIlgOa5J6_2TOb',
    id: 11,
    isDeleted: false,
    orderSeq: 102,
    transType: 1,
  },
  {
    categoryName: 'Bills',
    fbId: '-M2eltVIlgOa5J6_2TOc',
    id: 68,
    isDeleted: false,
    orderSeq: 103,
    transType: 1,
  },
  {
    categoryName: 'Culture',
    fbId: '-M2eltVIlgOa5J6_2TOd',
    id: 10,
    isDeleted: false,
    orderSeq: 104,
    transType: 1,
  },
  {
    categoryName: 'Car',
    fbId: '-M2eltVJq5ftBKdh2_co',
    id: 56,
    isDeleted: false,
    orderSeq: 105,
    transType: 1,
  },
  {
    categoryName: 'Beauty',
    fbId: '-M2eltVJq5ftBKdh2_cp',
    id: 13,
    isDeleted: false,
    orderSeq: 106,
    transType: 1,
  },
  {
    categoryName: 'Clothes',
    fbId: '-M2eltVJq5ftBKdh2_cq',
    id: 12,
    isDeleted: false,
    orderSeq: 107,
    transType: 1,
  },
  {
    categoryName: 'Transportation',
    fbId: '-M2eltVJq5ftBKdh2_cr',
    id: 9,
    isDeleted: false,
    orderSeq: 108,
    transType: 1,
  },
  {
    categoryName: 'Health',
    fbId: '-M2eltVK_LQzgiI63skZ',
    id: 14,
    isDeleted: false,
    orderSeq: 109,
    transType: 1,
  },
  {
    categoryName: 'Gift',
    fbId: '-M2eltVK_LQzgiI63sk_',
    id: 16,
    isDeleted: false,
    orderSeq: 110,
    transType: 1,
  },
  {
    categoryName: 'Computer',
    fbId: '-M2eltVK_LQzgiI63ska',
    id: 15,
    isDeleted: false,
    orderSeq: 111,
    transType: 1,
  },
  {
    categoryName: 'Alcohol',
    fbId: '-M2eltVK_LQzgiI63skb',
    id: 55,
    isDeleted: false,
    orderSeq: 112,
    transType: 1,
  },
  {
    categoryName: 'Lucy Lu',
    fbId: '-M2eltVLXx4qKiNh5U5v',
    id: 101,
    isDeleted: false,
    orderSeq: 113,
    transType: 1,
  },
  {
    categoryName: 'Travel',
    fbId: '-M2eltVLXx4qKiNh5U5w',
    id: 17,
    isDeleted: false,
    orderSeq: 114,
    transType: 1,
  },
  {
    categoryName: 'Pipe',
    fbId: '-M2eltVLXx4qKiNh5U5x',
    id: 64,
    isDeleted: false,
    orderSeq: 115,
    transType: 1,
  },
  {
    categoryName: 'Salary',
    fbId: '-M2eltVLXx4qKiNh5U5y',
    id: 2,
    isDeleted: true,
    orderSeq: 116,
    transType: 0,
  },
  {
    categoryName: 'Petty cash',
    fbId: '-M2eltVLXx4qKiNh5U5z',
    id: 3,
    isDeleted: true,
    orderSeq: 117,
    transType: 0,
  },
  {
    categoryName: 'Gifts',
    fbId: '-M2eltVM9APZ5vr7k3rB',
    id: 4,
    isDeleted: false,
    orderSeq: 118,
    transType: 0,
  },
  {
    categoryName: 'Allowance',
    fbId: '-M2eltVM9APZ5vr7k3rC',
    id: 1,
    isDeleted: false,
    orderSeq: 119,
    transType: 0,
  },
  {
    categoryName: 'Social Life',
    fbId: '-M2eltVM9APZ5vr7k3rD',
    id: 7,
    isDeleted: true,
    orderSeq: 120,
    transType: 1,
  },
  {
    categoryName: 'Other',
    fbId: '-M2eltVM9APZ5vr7k3rE',
    id: 5,
    isDeleted: true,
    orderSeq: 121,
    transType: 0,
  },
  {
    categoryName: 'Self-development',
    fbId: '-M2eltVM9APZ5vr7k3rF',
    id: 8,
    isDeleted: true,
    orderSeq: 122,
    transType: 1,
  },
  {
    categoryName: 'Gifts',
    fbId: '-M2eltVNsU25b1sgEQ3S',
    id: 80,
    isDeleted: true,
    orderSeq: 181,
    transType: 0,
  },
];

const SUBCATEGORIES = [
  {
    fbId: '-M2f9WjcunH9xQSjI33J',
    id: 25,
    isDeleted: true,
    mainCategoryId: 7,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rD',
    orderSeq: 129,
    subCategoryName: 'Dues',
    transType: 1,
  },
  {
    fbId: '-M2f9WjecItbfCIaP-bD',
    id: 27,
    isDeleted: true,
    mainCategoryId: 9,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cr',
    orderSeq: 131,
    subCategoryName: 'Subway',
    transType: 1,
  },
  {
    fbId: '-M2f9WjecItbfCIaP-bE',
    id: 26,
    isDeleted: true,
    mainCategoryId: 9,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cr',
    orderSeq: 130,
    subCategoryName: 'Bus',
    transType: 1,
  },
  {
    fbId: '-M2f9WjfI8wdep0-tt5y',
    id: 98,
    isDeleted: false,
    mainCategoryId: 14,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skZ',
    orderSeq: 199,
    subCategoryName: 'Suppliments',
    transType: 1,
  },
  {
    fbId: '-M2f9WjfI8wdep0-tt5z',
    id: 60,
    isDeleted: false,
    mainCategoryId: 9,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cr',
    orderSeq: 133,
    subCategoryName: 'Gocard',
    transType: 1,
  },
  {
    fbId: '-M2f9WjfI8wdep0-tt6-',
    id: 29,
    isDeleted: false,
    mainCategoryId: 9,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cr',
    orderSeq: 132,
    subCategoryName: 'Car',
    transType: 1,
  },
  {
    fbId: '-M2f9WjfI8wdep0-tt60',
    id: 32,
    isDeleted: false,
    mainCategoryId: 10,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOd',
    orderSeq: 138,
    subCategoryName: 'Music',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjg27jG8jy9PMTT',
    id: 31,
    isDeleted: false,
    mainCategoryId: 10,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOd',
    orderSeq: 137,
    subCategoryName: 'Movie',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjg27jG8jy9PMTU',
    id: 33,
    isDeleted: false,
    mainCategoryId: 10,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOd',
    orderSeq: 139,
    subCategoryName: 'Apps',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjg27jG8jy9PMTV',
    id: 30,
    isDeleted: false,
    mainCategoryId: 10,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOd',
    orderSeq: 136,
    subCategoryName: 'Books',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjg27jG8jy9PMTW',
    id: 36,
    isDeleted: false,
    mainCategoryId: 11,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOb',
    orderSeq: 142,
    subCategoryName: 'Kitchen',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjh5kvAB7EdVcWF',
    id: 34,
    isDeleted: false,
    mainCategoryId: 11,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOb',
    orderSeq: 140,
    subCategoryName: 'Appliances',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjh5kvAB7EdVcWG',
    id: 35,
    isDeleted: false,
    mainCategoryId: 11,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOb',
    orderSeq: 141,
    subCategoryName: 'Furniture',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjh5kvAB7EdVcWH',
    id: 65,
    isDeleted: false,
    mainCategoryId: 4,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rB',
    orderSeq: 184,
    subCategoryName: 'Birthday',
    transType: 0,
  },
  {
    fbId: '-M2f9Wjh5kvAB7EdVcWI',
    id: 94,
    isDeleted: false,
    mainCategoryId: 4,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rB',
    orderSeq: 194,
    subCategoryName: 'Repayments',
    transType: 0,
  },
  {
    fbId: '-M2f9WjiSAHhxTYOvp_S',
    id: 85,
    isDeleted: false,
    mainCategoryId: 9,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cr',
    orderSeq: 134,
    subCategoryName: 'post',
    transType: 1,
  },
  {
    fbId: '-M2f9WjiSAHhxTYOvp_T',
    id: 86,
    isDeleted: false,
    mainCategoryId: 17,
    mainCategoryIdFb: '-M2eltVLXx4qKiNh5U5w',
    orderSeq: 185,
    subCategoryName: 'Accomodation',
    transType: 1,
  },
  {
    fbId: '-M2f9WjiSAHhxTYOvp_U',
    id: 87,
    isDeleted: false,
    mainCategoryId: 17,
    mainCategoryIdFb: '-M2eltVLXx4qKiNh5U5w',
    orderSeq: 186,
    subCategoryName: 'Equipment',
    transType: 1,
  },
  {
    fbId: '-M2f9WjiSAHhxTYOvp_V',
    id: 88,
    isDeleted: false,
    mainCategoryId: 17,
    mainCategoryIdFb: '-M2eltVLXx4qKiNh5U5w',
    orderSeq: 187,
    subCategoryName: 'Train',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjjn8rYl5NBsd_g',
    id: 89,
    isDeleted: false,
    mainCategoryId: 17,
    mainCategoryIdFb: '-M2eltVLXx4qKiNh5U5w',
    orderSeq: 188,
    subCategoryName: 'Flights',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjjn8rYl5NBsd_h',
    id: 90,
    isDeleted: false,
    mainCategoryId: 17,
    mainCategoryIdFb: '-M2eltVLXx4qKiNh5U5w',
    orderSeq: 189,
    subCategoryName: 'Bus',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjjn8rYl5NBsd_i',
    id: 91,
    isDeleted: false,
    mainCategoryId: 17,
    mainCategoryIdFb: '-M2eltVLXx4qKiNh5U5w',
    orderSeq: 190,
    subCategoryName: 'Sims',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjjn8rYl5NBsd_j',
    id: 92,
    isDeleted: false,
    mainCategoryId: 6,
    mainCategoryIdFb: '-M2eltVFR8T426T5Egmh',
    orderSeq: 192,
    subCategoryName: 'Groceries',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjjn8rYl5NBsd_k',
    id: 93,
    isDeleted: false,
    mainCategoryId: 6,
    mainCategoryIdFb: '-M2eltVFR8T426T5Egmh',
    orderSeq: 193,
    subCategoryName: 'Eating out',
    transType: 1,
  },
  {
    fbId: '-M2f9WjkJ9EnZ2CPyfuE',
    id: 21,
    isDeleted: true,
    mainCategoryId: 6,
    mainCategoryIdFb: '-M2eltVFR8T426T5Egmh',
    orderSeq: 122,
    subCategoryName: 'Beverages',
    transType: 1,
  },
  {
    fbId: '-M2f9WjkJ9EnZ2CPyfuF',
    id: 22,
    isDeleted: true,
    mainCategoryId: 7,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rD',
    orderSeq: 123,
    subCategoryName: 'Friend',
    transType: 1,
  },
  {
    fbId: '-M2f9WjkJ9EnZ2CPyfuG',
    id: 24,
    isDeleted: true,
    mainCategoryId: 7,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rD',
    orderSeq: 125,
    subCategoryName: 'Alumni',
    transType: 1,
  },
  {
    fbId: '-M2f9WjkJ9EnZ2CPyfuH',
    id: 23,
    isDeleted: true,
    mainCategoryId: 7,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rD',
    orderSeq: 124,
    subCategoryName: 'Fellowship',
    transType: 1,
  },
  {
    fbId: '-M2f9WjlZr5In3LrlzYc',
    id: 18,
    isDeleted: true,
    mainCategoryId: 6,
    mainCategoryIdFb: '-M2eltVFR8T426T5Egmh',
    orderSeq: 126,
    subCategoryName: 'Lunch',
    transType: 1,
  },
  {
    fbId: '-M2f9WjlZr5In3LrlzYd',
    id: 19,
    isDeleted: true,
    mainCategoryId: 6,
    mainCategoryIdFb: '-M2eltVFR8T426T5Egmh',
    orderSeq: 127,
    subCategoryName: 'Dinner',
    transType: 1,
  },
  {
    fbId: '-M2f9WjlZr5In3LrlzYe',
    id: 20,
    isDeleted: true,
    mainCategoryId: 6,
    mainCategoryIdFb: '-M2eltVFR8T426T5Egmh',
    orderSeq: 128,
    subCategoryName: 'Eating out',
    transType: 1,
  },
  {
    fbId: '-M2f9WjlZr5In3LrlzYf',
    id: 96,
    isDeleted: false,
    mainCategoryId: 11,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOb',
    orderSeq: 197,
    subCategoryName: 'Plants',
    transType: 1,
  },
  {
    fbId: '-M2f9WjlZr5In3LrlzYg',
    id: 95,
    isDeleted: false,
    mainCategoryId: 14,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skZ',
    orderSeq: 196,
    subCategoryName: 'Dental Wojtek',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjm_52uKXNFE2g4',
    id: 28,
    isDeleted: false,
    mainCategoryId: 9,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cr',
    orderSeq: 135,
    subCategoryName: 'Taxi',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjm_52uKXNFE2g5',
    id: 57,
    isDeleted: true,
    mainCategoryId: 6,
    mainCategoryIdFb: '-M2eltVFR8T426T5Egmh',
    orderSeq: 161,
    subCategoryName: 'eating out',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjm_52uKXNFE2g6',
    id: 100,
    isDeleted: false,
    mainCategoryId: 55,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skb',
    orderSeq: 200,
    subCategoryName: 'Wine',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjm_52uKXNFE2g7',
    id: 99,
    isDeleted: false,
    mainCategoryId: 55,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skb',
    orderSeq: 201,
    subCategoryName: 'Beer',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjm_52uKXNFE2g8',
    id: 38,
    isDeleted: true,
    mainCategoryId: 11,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOb',
    orderSeq: 144,
    subCategoryName: 'Chandlery',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjn_BQZN-Tufun2',
    id: 59,
    isDeleted: true,
    mainCategoryId: 11,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOb',
    orderSeq: 163,
    subCategoryName: 'W4 energy',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjn_BQZN-Tufun3',
    id: 37,
    isDeleted: false,
    mainCategoryId: 11,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOb',
    orderSeq: 143,
    subCategoryName: 'Toiletries',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjn_BQZN-Tufun4',
    id: 40,
    isDeleted: false,
    mainCategoryId: 12,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cq',
    orderSeq: 146,
    subCategoryName: 'Wojtek ',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjn_BQZN-Tufun5',
    id: 39,
    isDeleted: true,
    mainCategoryId: 12,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cq',
    orderSeq: 145,
    subCategoryName: 'Clothing',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjn_BQZN-Tufun6',
    id: 42,
    isDeleted: true,
    mainCategoryId: 12,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cq',
    orderSeq: 148,
    subCategoryName: 'Laundry',
    transType: 1,
  },
  {
    fbId: '-M2f9WjoZ_WO5lFuWLy8',
    id: 41,
    isDeleted: false,
    mainCategoryId: 12,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cq',
    orderSeq: 147,
    subCategoryName: 'Elaine',
    transType: 1,
  },
  {
    fbId: '-M2f9WjoZ_WO5lFuWLy9',
    id: 43,
    isDeleted: false,
    mainCategoryId: 13,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cp',
    orderSeq: 149,
    subCategoryName: 'Cosmetics',
    transType: 1,
  },
  {
    fbId: '-M2f9WjoZ_WO5lFuWLyA',
    id: 45,
    isDeleted: true,
    mainCategoryId: 13,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cp',
    orderSeq: 151,
    subCategoryName: 'Accessories',
    transType: 1,
  },
  {
    fbId: '-M2f9WjoZ_WO5lFuWLyB',
    id: 44,
    isDeleted: true,
    mainCategoryId: 13,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cp',
    orderSeq: 150,
    subCategoryName: 'Makeup',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjp2Iu4TlZxU2rg',
    id: 46,
    isDeleted: false,
    mainCategoryId: 13,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cp',
    orderSeq: 152,
    subCategoryName: 'Botox Clinic',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjp2Iu4TlZxU2rh',
    id: 47,
    isDeleted: false,
    mainCategoryId: 14,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skZ',
    orderSeq: 153,
    subCategoryName: 'Doctor',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjp2Iu4TlZxU2ri',
    id: 48,
    isDeleted: true,
    mainCategoryId: 14,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skZ',
    orderSeq: 154,
    subCategoryName: 'Yoga',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjp2Iu4TlZxU2rj',
    id: 49,
    isDeleted: false,
    mainCategoryId: 14,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skZ',
    orderSeq: 155,
    subCategoryName: 'Hospital',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjq9SLYuC373tKj',
    id: 50,
    isDeleted: false,
    mainCategoryId: 14,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skZ',
    orderSeq: 156,
    subCategoryName: 'Medicine',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjq9SLYuC373tKk',
    id: 58,
    isDeleted: false,
    mainCategoryId: 14,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skZ',
    orderSeq: 162,
    subCategoryName: 'Dental elaine',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjq9SLYuC373tKl',
    id: 75,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 176,
    subCategoryName: 'Gas & electric',
    transType: 1,
  },
  {
    fbId: '-M2f9WjrjtV0wWjVGpOL',
    id: 77,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 178,
    subCategoryName: 'Origin Hot Water',
    transType: 1,
  },
  {
    fbId: '-M2f9WjrjtV0wWjVGpOM',
    id: 78,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 179,
    subCategoryName: 'BCC Rates',
    transType: 1,
  },
  {
    fbId: '-M2f9WjrjtV0wWjVGpON',
    id: 79,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 180,
    subCategoryName: 'Urban Utilities',
    transType: 1,
  },
  {
    fbId: '-M2f9WjrjtV0wWjVGpOO',
    id: 76,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 177,
    subCategoryName: 'Body Corp',
    transType: 1,
  },
  {
    fbId: '-M2f9WjrjtV0wWjVGpOP',
    id: 81,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 175,
    subCategoryName: 'W4 electricity',
    transType: 1,
  },
  {
    fbId: '-M2f9WjsQEPtYT4Wwxyd',
    id: 83,
    isDeleted: false,
    mainCategoryId: 4,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rB',
    orderSeq: 183,
    subCategoryName: 'Gumtree',
    transType: 0,
  },
  {
    fbId: '-M2f9WjsQEPtYT4Wwxye',
    id: 66,
    isDeleted: false,
    mainCategoryId: 4,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rB',
    orderSeq: 167,
    subCategoryName: 'Xmas',
    transType: 0,
  },
  {
    fbId: '-M2f9WjsQEPtYT4Wwxyf',
    id: 67,
    isDeleted: false,
    mainCategoryId: 13,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_cp',
    orderSeq: 168,
    subCategoryName: 'Hair',
    transType: 1,
  },
  {
    fbId: '-M2f9WjsQEPtYT4Wwxyg',
    id: 82,
    isDeleted: true,
    mainCategoryId: 14,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skZ',
    orderSeq: 182,
    subCategoryName: 'Suppliments',
    transType: 1,
  },
  {
    fbId: '-M2f9WjsQEPtYT4Wwxyh',
    id: 51,
    isDeleted: true,
    mainCategoryId: 15,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63ska',
    orderSeq: 157,
    subCategoryName: 'Schooling',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjt2uaZLtfC_5C8',
    id: 52,
    isDeleted: true,
    mainCategoryId: 15,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63ska',
    orderSeq: 158,
    subCategoryName: 'Textbooks',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjt2uaZLtfC_5C9',
    id: 54,
    isDeleted: true,
    mainCategoryId: 15,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63ska',
    orderSeq: 160,
    subCategoryName: 'Academy',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjt2uaZLtfC_5CA',
    id: 53,
    isDeleted: true,
    mainCategoryId: 15,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63ska',
    orderSeq: 159,
    subCategoryName: 'School supplies',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjt2uaZLtfC_5CB',
    id: 61,
    isDeleted: false,
    mainCategoryId: 10,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOd',
    orderSeq: 164,
    subCategoryName: 'Games',
    transType: 1,
  },
  {
    fbId: '-M2f9Wjt2uaZLtfC_5CC',
    id: 63,
    isDeleted: true,
    mainCategoryId: 15,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63ska',
    orderSeq: 166,
    subCategoryName: 'Computer',
    transType: 1,
  },
  {
    fbId: '-M2f9Wju1YfNiRv8j7w-',
    id: 62,
    isDeleted: true,
    mainCategoryId: 55,
    mainCategoryIdFb: '-M2eltVK_LQzgiI63skb',
    orderSeq: 165,
    subCategoryName: 'Pipe',
    transType: 1,
  },
  {
    fbId: '-M2f9Wju1YfNiRv8j7w0',
    id: 97,
    isDeleted: false,
    mainCategoryId: 11,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOb',
    orderSeq: 198,
    subCategoryName: 'Netflix',
    transType: 1,
  },
  {
    fbId: '-M2f9Wju1YfNiRv8j7w1',
    id: 73,
    isDeleted: false,
    mainCategoryId: 56,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_co',
    orderSeq: 173,
    subCategoryName: 'Petrol',
    transType: 1,
  },
  {
    fbId: '-M2f9Wju1YfNiRv8j7w2',
    id: 71,
    isDeleted: false,
    mainCategoryId: 56,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_co',
    orderSeq: 171,
    subCategoryName: 'Rego',
    transType: 1,
  },
  {
    fbId: '-M2f9Wju1YfNiRv8j7w3',
    id: 72,
    isDeleted: false,
    mainCategoryId: 56,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_co',
    orderSeq: 172,
    subCategoryName: 'Insurance',
    transType: 1,
  },
  {
    fbId: '-M2f9Wju1YfNiRv8j7w4',
    id: 74,
    isDeleted: false,
    mainCategoryId: 56,
    mainCategoryIdFb: '-M2eltVJq5ftBKdh2_co',
    orderSeq: 174,
    subCategoryName: 'Service',
    transType: 1,
  },
  {
    fbId: '-M2f9WjvXTq44pCkcgjA',
    id: 70,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 170,
    subCategoryName: 'Optus wifi',
    transType: 1,
  },
  {
    fbId: '-M2f9WjvXTq44pCkcgjB',
    id: 69,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 169,
    subCategoryName: 'Mobiles',
    transType: 1,
  },
  {
    fbId: '-M2f9WjvXTq44pCkcgjC',
    id: 84,
    isDeleted: false,
    mainCategoryId: 4,
    mainCategoryIdFb: '-M2eltVM9APZ5vr7k3rB',
    orderSeq: 195,
    subCategoryName: 'Odd jobs',
    transType: 0,
  },
  {
    fbId: '-M2f9WjvXTq44pCkcgjD',
    id: 102,
    isDeleted: false,
    mainCategoryId: 68,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOc',
    orderSeq: 209,
    subCategoryName: 'Immigration',
    transType: 1,
  },
  {
    fbId: '-M2f9WjvXTq44pCkcgjE',
    id: 103,
    isDeleted: false,
    mainCategoryId: 10,
    mainCategoryIdFb: '-M2eltVIlgOa5J6_2TOd',
    orderSeq: 210,
    subCategoryName: 'Netflix',
    transType: 1,
  },
];

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  category: Category[];
  subCategory: SubCategory[];
  account: Account[];
  transaction: any[];
  totals: any[];

  categoryFb$: Observable<any[]>;

  categoryFromFb: any[];
  subCategoryFromFb: any[];
  accountFromFb: any[];
  transactionFromFb: any[];
  catorderFromFb: any[];

  catsRef: AngularFireList<any>;
  subCatsRef: AngularFireList<any>;
  accountRef: AngularFireList<any>;

  constructor(private db: AngularFireDatabase, private http: HttpClient) {
    // .startAt('2020-02-01')
    /*     const transRef = db.list('transaction', ref => ref.orderByChild('date').startAt('2020-01-01'));
    transRef.valueChanges().subscribe(data => {
      // console.log('TC: HomePage -> transaction -> data', JSON.stringify(data, null, 2));
      this.transactionFromFb = data;
    });
    db.list('account')
      .valueChanges()
      .subscribe(res => {
        console.log('TC: HomePage -> account -> res', res);
        this.accountFromFb = res;
      });
    db.list('category')
      .valueChanges()
      .subscribe(res => {
        console.log('TC: HomePage -> category -> res', res);
        this.categoryFromFb = res;
      });
    db.list('subcategory')
      .valueChanges()
      .subscribe(res => {
        console.log('TC: HomePage -> subcategory -> res', res);
        this.subCategoryFromFb = res;
      }); */

    db.list('catorder')
      .valueChanges()
      .subscribe(res => {
        console.log('TC: HomePage -> catorder -> res', res);
        this.catorderFromFb = res;
      });
  }

  ngOnInit(): void {
    // this.fetchCategory();
    // this.fetchSubCategory();
    // this.fetchAccount();
    // this.fetchTransaction();
    // this.fetchTotals();
  }

  fetchCategory() {
    this.http.get('./assets/category.json').subscribe((res: Category[]) => {
      console.log('TC: HomePage -> fetchCategory -> res', res);
      this.category = res;
    });
  }

  fetchSubCategory() {
    this.http.get('./assets/subcategory.json').subscribe((res: SubCategory[]) => {
      console.log('TC: HomePage -> fetchSubCategory -> res', res);
      this.subCategory = res;
    });
  }

  fetchTransaction() {
    this.http.get('./assets/transaction.json').subscribe((res: any[]) => {
      // console.log('TC: HomePage -> transaction -> res', res);
      this.transaction = res;
    });
  }

  fetchTotals() {
    this.http.get('./assets/totals.json').subscribe((res: any[]) => {
      console.log('TC: HomePage -> totals -> res', res);
      this.totals = res;
    });
  }

  fetchAccount() {
    this.http.get('./assets/account.json').subscribe((res: Account[]) => {
      console.log('TC: HomePage -> fetchSubCategory -> res', res);
      this.account = res;
    });
  }

  importTransaction() {
    let tempArray = [];
    const transRef = this.db.list<any>('transaction');
    this.transaction.forEach(async item => {
      const category = this.categoryFromFb.find(c => c.id === item.main_category_id);
      const subcategoryIdx = this.subCategoryFromFb.findIndex(s => s.id === item.sub_category_id);
      const subcat = subcategoryIdx === -1 ? null : this.subCategoryFromFb[subcategoryIdx];
      const subCatName = subcat === null ? {} : subcat.subCategoryName;
      const subCategoryId = subcat === null ? null : subcat.fbId;
      const account = this.accountFromFb.find(a => a.id === item.account_id);
      const keyRef = this.db.createPushId();
      const payload = {
        id: keyRef,
        // id: item.id,
        accId: account.fbId,
        accName: account.accountName,
        type: item.trans_type,
        amount: item.amount,
        time: item.full_date.slice(11, 19),
        date: item.short_date,
        month: item.short_date.slice(0, 7),
        catFull: item.category_name,
        memo: item.memo || null,
        deleted: item.is_deleted,
        mainCatId: category.fbId,
        catName: category.categoryName,
        subCatId: subCategoryId,
        subCatName,
      };
      // tempArray.push(payload);
      await transRef.set(`${keyRef}`, payload).then(_ => console.log('Done'));
    });
    // console.log('TC: HomePage -> imporTransaction -> tempArray', tempArray);
  }

  importTotals() {
    const totalsRef = this.db.list<any>('totals');
    this.totals['expense'].forEach(async item => {
      await totalsRef
        .set(item.month, { month: item.month, expense: item.expense })
        .then(_ => console.log('Done'));
    });
    this.totals['income'].forEach(async item => {
      await totalsRef.update(item.month, { income: item.income }).then(_ => console.log('Done'));
    });
    // {month: "2019-01", expense: 6305.29}
  }

  replaceAccounts() {
    const accRef = this.db.list('account');
    ACCOUNTS.forEach(async item => {
      const payload = {
        id: item.fbId,
        accName: item.accountName,
        isDeleted: item.isDeleted,
      };
      console.log('TC: HomePage -> replaceAccounts -> payload', payload);
      await accRef.set(payload.id, payload).then(() => console.log('Done'));
    });
  }

  replaceCategories() {
    const catsRef = this.db.list('category');
    CATEGORIES.forEach(async item => {
      const payload = {
        id: item.fbId,
        catName: item.categoryName,
        isDeleted: item.isDeleted,
        type: item.transType,
      };
      await catsRef.set(payload.id, payload).then(() => console.log('Done'));
    });
  }

  async replaceCatsOrder() {
    const catsOrderRef = this.db.list('catorder');
    let tempArr = [];
    CATEGORIES.forEach(item => {
      tempArr.push(item.fbId);
    });
    console.log('TC: HomePage -> replaceCatsOrder -> tempArr', tempArr);
    await catsOrderRef.set('/', tempArr);
  }

  replaceSubCats() {
    const subCatsRef = this.db.list('subcategory');
    SUBCATEGORIES.forEach(async item => {
      const payload = {
        id: item.fbId,
        mainCategoryId: item.mainCategoryIdFb,
        subCatName: item.subCategoryName,
        type: item.transType,
        isDeleted: item.isDeleted,
      };
      await subCatsRef.set(payload.id, payload).then(() => console.log('Done'));
    });
  }

   async replaceSubCatsOrder() {
    const subCatsOrderRef = this.db.list('subcatorder');
    let tempArr = [];
    SUBCATEGORIES.forEach(item => {
      tempArr.push(item.fbId);
    });
    console.log('TC: HomePage -> replaceCatsOrder -> tempArr', tempArr);
    await subCatsOrderRef.set('/', tempArr);
  }

  importCategory() {
    this.catsRef = this.db.list<any>('category');
    this.category.forEach(async item => {
      const keyRef = this.db.createPushId();
      const payload = {
        fbId: keyRef,
        id: item.id,
        isDeleted: item.is_deleted,
        categoryName: item.category_name,
        transType: item.trans_type,
        orderSeq: item.order_seq,
      };
      await this.catsRef.set(keyRef, payload).then(_ => console.log('Done'));
    });
  }

  importSubCategory() {
    this.subCatsRef = this.db.list<any>('subcategory');
    this.subCategory.forEach(async item => {
      const mainCategoryIdFb = this.categoryFromFb.find(c => c.id === item.main_category_id).fbId;
      const keyRef = this.db.createPushId();
      const payload = {
        fbId: keyRef,
        id: item.id,
        isDeleted: item.is_deleted,
        subCategoryName: item.sub_category_name,
        transType: item.trans_type,
        orderSeq: item.order_seq,
        mainCategoryId: item.main_category_id,
        mainCategoryIdFb,
      };
      await this.subCatsRef.set(keyRef, payload).then(_ => console.log('Done'));
    });
  }

  importAccount() {
    this.accountRef = this.db.list<any>('account');
    this.account.forEach(async item => {
      const keyRef = this.db.createPushId();
      // const key = item.id.toString();
      const payload = {
        fbId: keyRef,
        id: item.id,
        isDeleted: item.is_deleted,
        accountName: item.account_name,
        orderSeq: item.order_seq,
      };
      await this.accountRef.set(keyRef, payload).then(_ => console.log('Done'));
    });
  }
}

/*   categoryName: "Food"
fbId: "-M2eltVFR8T426T5Egmh"
id: 6
isDeleted: false
orderSeq: 101
transType: 1 */
