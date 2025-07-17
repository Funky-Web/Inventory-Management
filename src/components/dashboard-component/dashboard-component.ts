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
  @ViewChild('productForecastChart') productForecastChartRef!: ElementRef<HTMLCanvasElement>;

  inventoryChart!: Chart;
  forecastChart!: Chart;
  productForecastChart!: Chart;

  searchTerm = '';
  forecastPeriod = '30';
  showAddItem = false;
  selectedStatus = 'all';
  filteredItems: any[] = [];

  // Product forecasting properties
  showProductForecast = false;
  selectedProductId: number | null = null;
  selectedProductName = '';
  productForecastPeriod = '30';
  forecastAccuracy = 87;

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
          responsive: true,
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const item = items[index];
              this.selectProductForForecast(item);
            }
          }
        }
      });
    }

    this.renderForecastChart();
  }

  renderForecastChart() {
    const forecastLabels = this.generateForecastLabels();
    const forecastData = this.generateOverallForecastData();

    const ctx2 = this.forecastChartRef.nativeElement.getContext('2d');
    if (ctx2) {
      if (this.forecastChart) this.forecastChart.destroy();

      this.forecastChart = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: forecastLabels,
          datasets: [{
            label: 'Overall Demand Forecast',
            data: forecastData,
            borderColor: '#764ba2',
            backgroundColor: 'rgba(118, 75, 162, 0.2)',
            fill: true
          }]
        },
        options: {
          responsive: true
        }
      });
    }
  }

  renderProductForecastChart() {
    if (!this.selectedProductId || !this.productForecastChartRef) return;

    const forecastLabels = this.generateForecastLabels(this.productForecastPeriod);
    const forecastData = this.generateProductForecastData(this.selectedProductId);

    const ctx3 = this.productForecastChartRef.nativeElement.getContext('2d');
    if (ctx3) {
      if (this.productForecastChart) this.productForecastChart.destroy();

      this.productForecastChart = new Chart(ctx3, {
        type: 'line',
        data: {
          labels: forecastLabels,
          datasets: [{
            label: `${this.selectedProductName} Demand Forecast`,
            data: forecastData,
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.2)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Forecasted Demand'
              }
            }
          }
        }
      });
    }
  }

  generateForecastLabels(period: string = this.forecastPeriod): string[] {
    const days = parseInt(period);
    const labels: string[] = [];
    const today = new Date();

    for (let i = 1; i <= Math.min(days, 30); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      labels.push(`Day ${i}`);
    }

    return labels;
  }

  generateOverallForecastData(): number[] {
    const days = parseInt(this.forecastPeriod);
    const data: number[] = [];
    const baseValue = 50;

    for (let i = 1; i <= Math.min(days, 30); i++) {
      // Simulate seasonal trends and random variation
      const seasonal = Math.sin(i * 0.1) * 10;
      const random = (Math.random() - 0.5) * 20;
      const trend = i * 0.5; // Slight upward trend
      data.push(Math.max(0, baseValue + seasonal + random + trend));
    }

    return data;
  }

  generateProductForecastData(productId: number): number[] {
    const days = parseInt(this.productForecastPeriod);
    const data: number[] = [];
    const item = this.inventoryService.getInventoryItems().find(i => i.id === productId);

    if (!item) return [];

    // Base forecast on current inventory levels and historical patterns
    const baseValue = Math.max(1, Math.floor(item.quantity / 10));

    for (let i = 1; i <= Math.min(days, 30); i++) {
      // Simulate product-specific demand patterns
      const seasonal = Math.sin(i * 0.15) * (baseValue * 0.3);
      const random = (Math.random() - 0.5) * (baseValue * 0.4);
      const categoryMultiplier = this.getCategoryMultiplier(item.category);
      const trend = i * 0.1 * categoryMultiplier;

      data.push(Math.max(0, Math.round(baseValue + seasonal + random + trend)));
    }

    return data;
  }

  getCategoryMultiplier(category: string): number {
    // Different categories have different demand patterns
    const multipliers: { [key: string]: number } = {
      'Electronics': 1.2,
      'Clothing': 0.8,
      'Books': 0.6,
      'Home': 1.0,
      'Sports': 0.9
    };

    return multipliers[category] || 1.0;
  }

  selectProductForForecast(item: any) {
    this.selectedProductId = item.id;
    this.selectedProductName = item.name;
    this.showProductForecast = true;

    // Wait for the view to update before rendering chart
    setTimeout(() => {
      this.renderProductForecastChart();
    }, 100);
  }

  updateForecast() {
    this.renderForecastChart();
  }

  updateProductForecast() {
    this.renderProductForecastChart();
  }

  closeProductForecast() {
    this.showProductForecast = false;
    this.selectedProductId = null;
    this.selectedProductName = '';
    if (this.productForecastChart) {
      this.productForecastChart.destroy();
    }
  }

  getProductForecastInsights(): any[] {
    if (!this.selectedProductId) return [];

    const item = this.inventoryService.getInventoryItems().find(i => i.id === this.selectedProductId);
    if (!item) return [];

    const forecastData = this.generateProductForecastData(this.selectedProductId);
    const avgDemand = forecastData.reduce((a, b) => a + b, 0) / forecastData.length;
    const maxDemand = Math.max(...forecastData);
    const currentStock = item.quantity;
    const daysUntilStockout = currentStock / avgDemand;

    return [
      {
        label: 'Average Daily Demand',
        value: `${avgDemand.toFixed(1)} units`,
        icon: '📊'
      },
      {
        label: 'Peak Demand Expected',
        value: `${maxDemand} units`,
        icon: '📈'
      },
      {
        label: 'Current Stock Level',
        value: `${currentStock} units`,
        icon: '📦'
      },
      {
        label: 'Days Until Stockout',
        value: `${daysUntilStockout.toFixed(1)} days`,
        icon: '⏰'
      }
    ];
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
    return this.forecastAccuracy;
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
    this.editedItem = { ...item };
  }

  saveEdit() {
    if (this.editingItemId !== null) {
      this.inventoryService.updateItem(this.editingItemId, this.editedItem);
      this.editMode = false;
      this.editingItemId = null;
      this.editedItem = {};
      this.filterItems();
      this.initializeCharts();
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
    this.searchTerm = '';
    this.selectedStatus = 'low';
    this.filterItems();

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
