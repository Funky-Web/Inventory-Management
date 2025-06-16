import { Injectable } from '@angular/core';
import {ForecastedSalesInterface} from './forecasted-sales-interface';

@Injectable({
  providedIn: 'root'
})
export class ForecastedSalesService {

  constructor() { }

  forecastedSales: ForecastedSalesInterface[] = [
    new ForecastedSalesInterface(
      'January',
      22_000,
      21_200,
      23_010,
      'profit'
    ),
    new ForecastedSalesInterface(
      'February',
      22_000,
      21_200,
      23_010,
      'loss'
    ),
    new ForecastedSalesInterface(
      'March',
      22_000,
      21_200,
      23_010,
      'equal'
    ),
    new ForecastedSalesInterface(
      'April',
      22_000,
      21_200,
      23_010,
      'profit'
    ),
    new ForecastedSalesInterface(
      'May',
      22_000,
      21_200,
      23_010,
      'equal'
    ),
    new ForecastedSalesInterface(
      'June',
      22_000,
      21_200,
      23_010,
      'loss'
    ),
    new ForecastedSalesInterface(
      'July',
      22_000,
      21_200,
      23_010,
      'profit'
    ),
    new ForecastedSalesInterface(
      'August',
      22_000,
      21_200,
      23_010,
      'profit'
    ),
    new ForecastedSalesInterface(
      'September',
      22_000,
      21_200,
      23_010,
      'equal'
    ),
    new ForecastedSalesInterface(
      'October',
      22_000,
      21_200,
      23_010,
      'loss'
    ),
    new ForecastedSalesInterface(
      'November',
      22_000,
      21_200,
      23_010,
      'profit'
    ),
    new ForecastedSalesInterface(
      'December',
      22_000,
      21_200,
      23_010,
      'profit'
    ),
  ]


  getForecastedSales(): ForecastedSalesInterface[] {
    return this.forecastedSales;
  }
}
