import {Component, inject} from '@angular/core';
import {ForecastedSalesService} from './forecasted-sales-service';
import {ForecastedSalesInterface} from './forecasted-sales-interface';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-forecasted-sales',
  imports: [
    RouterLink
  ],
  templateUrl: './forecasted-sales.html',
  styleUrl: './forecasted-sales.css'
})
export class ForecastedSales {

  forecastedSalesService: ForecastedSalesService = inject(ForecastedSalesService);

  forecastedSales: ForecastedSalesInterface[] = [];

  constructor() {
    this.forecastedSales = this.forecastedSalesService.getForecastedSales();
  }

}
