import {Component, inject} from '@angular/core';
import {Product} from '../core/product';
import {ProductsService} from '../core/dao/products-service';

@Component({
  selector: 'app-forecast-sales',
  imports: [],
  templateUrl: './forecast-sales.html',
  styleUrl: './forecast-sales.css'
})
export class ForecastSales {

  productsService: ProductsService = inject(ProductsService);

  allProducts: Product[] = [];

  constructor() {
    this.allProducts = this.productsService.getAllProducts();
  }
}
