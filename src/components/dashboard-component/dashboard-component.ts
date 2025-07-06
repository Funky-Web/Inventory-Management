import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Chart} from 'chart.js/auto';
import {InventoryService} from '../../services/inventory-service';
import {AuthService} from '../../services/auth-service';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('inventoryChart') inventoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('forecastChart') forecastChartRef!: ElementRef<HTMLCanvasElement>;

  inventoryChart!: Chart;
  forecastChart!: Chart;

  searchTerm = '';
  forecastPeriod = '30';
  showAddItem = false;
  selectedStatus = 'all';
  filteredItems: any[] = [];

  editMode: boolean = false;
  editingItemId: number | null = null;
  editedItem: any = {};

  newItem = {
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier: ''
  };

  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    this.filterItems();
    this.initializeCharts();
  }

  initializeCharts() {
    const items = this.inventoryService.getInventoryItems();
    const inventoryLabels = items.map(i => i.name);
    const inventoryData = items.map(i => i.quantity);

    const ctx1 = this.inventoryChartRef.nativeElement.getContext('2d');
    if (ctx1) {
      if (this.inventoryChart) this.inventoryChart.destroy();

      this.inventoryChart = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: inventoryLabels,
          datasets: [{
            label: 'Inventory Quantity',
            data: inventoryData,
            backgroundColor: '#667eea'
          }]
        },
        options: {
          // maintainAspectRatio: false,
          responsive: true
        }
      });
    }

    this.renderForecastChart();
  }

  renderForecastChart() {
    const forecastLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
    const forecastData = [50, 60, 55, 70, 65]; // Mock

    const ctx2 = this.forecastChartRef.nativeElement.getContext('2d');
    if (ctx2) {
      if (this.forecastChart) this.forecastChart.destroy();

      this.forecastChart = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: forecastLabels,
          datasets: [{
            label: 'Forecast',
            data: forecastData,
            borderColor: '#764ba2',
            backgroundColor: 'rgba(118, 75, 162, 0.2)',
            fill: true
          }]
        },
        options: {
          // maintainAspectRatio: false,
          responsive: true
        }
      });
    }
  }


  updateForecast() {
    this.renderForecastChart();
  }

  logout() {
    this.authService.logout();
  }

  getTotalItems(): number {
    return this.inventoryService.getInventoryItems().length;
  }

  getLowStockCount(): number {
    return this.inventoryService.getInventoryItems().filter(item => item.quantity < 10).length;
  }

  getTotalValue(): number {
    return this.inventoryService.getInventoryItems()
      .reduce((total, item) => total + (item.quantity * item.price), 0);
  }

  getForecastAccuracy(): number {
    return 87;
  }



  filterItems(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const allItems = this.inventoryService.getInventoryItems();

    this.filteredItems = allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(term)
        || item.category.toLowerCase().includes(term)
        || item.supplier.toLowerCase().includes(term);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'in' && item.quantity >= 10) ||
        (this.selectedStatus === 'low' && item.quantity > 0 && item.quantity < 10) ||
        (this.selectedStatus === 'out' && item.quantity === 0);

      return matchesSearch && matchesStatus;
    });
  }

  resetFilter(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.filteredItems = this.inventoryService.getInventoryItems();
  }


  addItem() {
    if (this.newItem.name && this.newItem.category) {
      this.inventoryService.addItem({
        ...this.newItem,
        id: Date.now()
      });
      this.newItem = { name: '', category: '', quantity: 0, price: 0, supplier: '' };
      this.showAddItem = false;
      this.filterItems();
      this.initializeCharts();
    }
  }

  editItem(item: any) {
    this.editMode = true;
    this.editingItemId = item.id;
    this.editedItem = { ...item }; // clone to avoid direct mutation
  }

  saveEdit() {
    if (this.editingItemId !== null) {
      this.inventoryService.updateItem(this.editingItemId, this.editedItem);
      this.editMode = false;
      this.editingItemId = null;
      this.editedItem = {};
      this.filterItems(); // Refresh the displayed list
    }
  }


  cancelEdit() {
    this.editMode = false;
    this.editingItemId = null;
    this.editedItem = {};
  }

  deleteItem(id: number) {
    this.inventoryService.deleteItem(id);
    this.filterItems();
    this.initializeCharts();
  }


  getStatus(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  }

  getStatusClass(quantity: number): string {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 10) return 'low-stock';
    return 'in-stock';
  }



  getHighDemandItems() {
    return [
      { id: 1, name: 'Laptop Pro', forecast: 45 },
      { id: 2, name: 'Wireless Mouse', forecast: 120 },
      { id: 3, name: 'Monitor 4K', forecast: 30 }
    ];
  }

  getReorderRecommendations() {
    return this.inventoryService.getInventoryItems()
      .filter(item => item.quantity < 10)
      .map(item => ({
        id: item.id,
        name: item.name,
        recommended: Math.max(20, item.quantity * 3)
      }));
  }



  scrollToInventory(): void {
    const section = document.getElementById('inventory-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToLowStock(): void {
    // Manually set the filters
    this.searchTerm = '';
    this.selectedStatus = 'low';
    this.filterItems(); // Call the method without arguments

    setTimeout(() => {
      const section = document.getElementById('inventory-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });

        const lowStockRows = document.querySelectorAll('.status-badge.low-stock');
        lowStockRows.forEach(row => {
          const parentRow = row.closest('tr');
          if (parentRow) {
            parentRow.classList.add('highlight');
            setTimeout(() => parentRow.classList.remove('highlight'), 1500);
          }
        });
      }
    }, 100);
  }

}
