import {Component, inject} from '@angular/core';
import {RecentSales} from './recent-sales';
import {RecentSalesActivity} from './recent-sales-activity';
import {FormsModule} from '@angular/forms';
import {SalesLineChartComponent} from './sales-line-chart/sales-line-chart';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    FormsModule,
    SalesLineChartComponent,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true
})
export class Dashboard {

  recentSalesActivity: RecentSalesActivity = inject(RecentSalesActivity);

  recentSales: RecentSales[] = [];

  constructor() {
    this.recentSales = this.recentSalesActivity.getRecentSales();
  }
}
