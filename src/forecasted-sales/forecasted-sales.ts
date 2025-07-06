import {Component, inject} from '@angular/core';
import {ForecastedSalesService} from './forecasted-sales-service';
import {ForecastedSalesInterface} from './forecasted-sales-interface';

@Component({
  selector: 'app-forecasted-sales',
  imports: [],
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
