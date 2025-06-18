import {Component, inject} from '@angular/core';
import {Dialog, DialogModule} from '@angular/cdk/dialog';
import {Product} from '../core/product';
import {ProductsService} from '../core/dao/products-service';
import {AddNewProductDialog} from '../shared/add-new-product-dialog/add-new-product-dialog';

@Component({
  selector: 'app-forecast-sales',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './forecast-sales.html',
  styleUrl: './forecast-sales.css'
})
export class ForecastSales {
  productsService: ProductsService = inject(ProductsService);
  allProducts: Product[] = [];
  selectedProduct: Product | null = null;

  constructor(public dialog: Dialog) {
    this.allProducts = this.productsService.getAllProducts();
  }

  openDialog(product: Product): void {
    this.selectedProduct = product;

    this.dialog.open(AddNewProductDialog, {
      data: { product }
    });
  }
}
