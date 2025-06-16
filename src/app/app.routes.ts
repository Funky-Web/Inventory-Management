import { Routes } from '@angular/router';
import {Dashboard} from '../dashboard/dashboard';
import {ForecastedSales} from '../forecasted-sales/forecasted-sales';
import {ForecastSales} from '../forecast-sales/forecast-sales';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    title: 'Inventory - Dashboard'
  },
  {
    path: 'forecasted-sales',
    component: ForecastedSales,
    title: 'Inventory - Forecasted Sales'
  },
  {
    path: 'forecast-sales',
    component: ForecastSales,
    title: 'Inventory - Forecast Sales'
  }
];
