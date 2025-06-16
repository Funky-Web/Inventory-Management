import { Injectable } from '@angular/core';
import {Product} from '../product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor() { }

  products: Product[] = [
    new Product(
      '123456',
      'Mango'
    ),
    new Product(
      '123456',
      'Football'
    ),
    new Product(
      '123456',
      'Bel Cola'
    ),
    new Product(
      '123456',
      'Carrot'
    ),
    new Product(
      '123456',
      'Volleyball'
    ),
    new Product(
      '123456',
      'Air Force 1'
    ),
    new Product(
      '123456',
      'Gucci mini bag'
    ),
    new Product(
      '123456',
      'Class 1 Aki Ola'
    ),
    new Product(
      '123456',
      'Sugar cubes'
    ),
    new Product(
      '123456',
      'Frytol Cooking oil'
    ),
    new Product(
      '123456',
      'Basmati rice'
    ),
    new Product(
      '123456',
      'Green Apples'
    ),
    new Product(
      '123456',
      'Orange'
    ),
    new Product(
      '123456',
      'Voltic mineral water'
    ),
    new Product(
      '123456',
      'Ekunfi Fruit Juice'
    ),
    new Product(
      '123456',
      'Afro metal comb'
    ),
    new Product(
      '123456',
      'Male crocs'
    ),
    new Product(
      '123456',
      'Vita Milk'
    ),
    new Product(
      '123456',
      'Citro C'
    ),
    new Product(
      '123456',
      'Big pen'
    ),
    new Product(
      '123456',
      '12 color crayons'
    )
  ];

  getAllProducts(): Product[] {
    return this.products;
  }
}
