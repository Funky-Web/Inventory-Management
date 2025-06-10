import { Injectable } from '@angular/core';
import {RecentSales} from './recent-sales';

@Injectable({
  providedIn: 'root'
})
export class RecentSalesActivity {

  constructor() { }

  getRecentSales(): RecentSales[] {
    return [
      new RecentSales(
        "04/10/2025", "Orange Juice", 345, true
      ),
      new RecentSales(
        "01/03/2025", "Apple Juice", 12, false
      ),
      new RecentSales(
        "11/10/2025", "Grape Juice", 2, true
      ),
      new RecentSales(
        "01/12/2025", "Lemonade", 12, false
      ),
      new RecentSales(
        "04/10/2025", "Orange Juice", 345, true
      ),
      new RecentSales(
        "01/03/2025", "Apple Juice", 12, false
      ),
      new RecentSales(
        "04/10/2025", "Orange Juice", 345, true
      ),
      new RecentSales(
        "01/03/2025", "Apple Juice", 12, false
      ),
      new RecentSales(
        "11/10/2025", "Grape Juice", 2, true
      ),
      new RecentSales(
        "01/12/2025", "Lemonade", 12, false
      )
    ];
  }
}
