import { Injectable } from '@angular/core';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor() { }

  private inventoryItems: InventoryItem[] = [];

  generateSampleData() {
    this.inventoryItems = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', quantity: 15, price: 1299.99, supplier: 'TechCorp' },
      { id: 2, name: 'Wireless Mouse', category: 'Electronics', quantity: 45, price: 29.99, supplier: 'TechCorp' },
      { id: 3, name: 'Monitor 4K', category: 'Electronics', quantity: 8, price: 399.99, supplier: 'DisplayTech' },
      { id: 4, name: 'Office Chair', category: 'Furniture', quantity: 25, price: 249.99, supplier: 'ComfortSeats' },
      { id: 5, name: 'Desk Lamp', category: 'Furniture', quantity: 30, price: 79.99, supplier: 'LightUp' },
      { id: 6, name: 'Notebook Set', category: 'Stationery', quantity: 5, price: 12.99, supplier: 'PaperPlus' },
      { id: 7, name: 'Pen Pack', category: 'Stationery', quantity: 60, price: 8.99, supplier: 'WriteWell' },
      { id: 8, name: 'Coffee Maker', category: 'Appliances', quantity: 12, price: 159.99, supplier: 'BrewMaster' },
      { id: 9, name: 'Water Bottle', category: 'Accessories', quantity: 3, price: 19.99, supplier: 'HydroGear' },
      { id: 10, name: 'Keyboard', category: 'Electronics', quantity: 20, price: 89.99, supplier: 'TechCorp' }
    ];
  }

  getInventoryItems(): InventoryItem[] {
    return this.inventoryItems;
  }

  addItem(item: InventoryItem) {
    this.inventoryItems.push(item);
  }

  deleteItem(id: number) {
    this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
  }

  updateItem(id: number, updatedItem: Partial<InventoryItem>) {
    const index = this.inventoryItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.inventoryItems[index] = { ...this.inventoryItems[index], ...updatedItem };
    }
  }
}
