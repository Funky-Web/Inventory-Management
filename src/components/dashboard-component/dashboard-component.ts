import {AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {DecimalPipe, CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Chart} from 'chart.js/auto';
import {HttpInventoryService, InventoryItem, InventoryMetrics, CreateInventoryItem, UpdateInventoryItem, StockStatus} from '../../services/inventory-service';
import {HttpAuthService, User} from '../../services/auth-service';
import {HttpForecastService, ForecastData, ProductForecast} from '../../services/forecast-service';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [DecimalPipe, FormsModule, CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inventoryChart') inventoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('forecastChart') forecastChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('productForecastChart') productForecastChartRef!: ElementRef<HTMLCanvasElement>;

  inventoryChart!: Chart;
  forecastChart!: Chart;
  productForecastChart!: Chart;

  // Data properties
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  metrics: InventoryMetrics | null = null;
  currentUser: User | null = null;
  categories: string[] = [];
  suppliers: string[] = [];

  // UI state
  searchTerm = '';
  forecastPeriod = '30';
  showAddItem = false;
  selectedStatus = 'all';
  isLoading = false;
  errorMessage = '';

  // Product forecast
  showProductForecast = false;
  selectedProductId: number | null = null;
  selectedProductName = '';
  productForecastPeriod = '30';
  productForecastData: ProductForecast | null = null;

  // Edit mode
  editingItemId: number | null = null;
  editedItem: Partial<UpdateInventoryItem> = {};

  // New item form
  newItem: CreateInventoryItem = {
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier: '',
    minStockLevel: 10,
    maxStockLevel: 100
  };

  private destroy$ = new Subject<void>();

  constructor(
    private inventoryService: HttpInventoryService,
    private authService: HttpAuthService,
    private forecastService: HttpForecastService
  ) {}

  ngOnInit() {
    // Load data only after user is ready
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadInitialData();
      }
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private async loadInitialData() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await Promise.all([
        this.loadInventoryItems(),
        this.loadMetrics(),
        this.loadCategories(),
        this.loadSuppliers()
      ]);
      this.isLoading = false;
      this.initializeCharts();
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.errorMessage = 'Failed to load dashboard data';
      this.isLoading = false;
    }
  }

  private async loadInventoryItems() {
    try {
      const response = await firstValueFrom(
        this.inventoryService.getAllItems({ size: 1000 })
      );
      if (response?.success && response.data) {
        this.inventoryItems = response.data.content;
        this.filteredItems = [...this.inventoryItems];
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
      throw error;
    }
  }

  private async loadMetrics() {
    try {
      const response = await firstValueFrom(this.inventoryService.getMetrics());
      if (response?.success && response.data) {
        this.metrics = response.data;
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      throw error;
    }
  }

  private async loadCategories() {
    try {
      const response = await firstValueFrom(this.inventoryService.getCategories());
      if (response?.success && response.data) {
        this.categories = response.data;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  private async loadSuppliers() {
    try {
      const response = await firstValueFrom(this.inventoryService.getSuppliers());
      if (response?.success && response.data) {
        this.suppliers = response.data;
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  }

  private getCurrentUser() {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
    });
  }

  initializeCharts() {
    if (!this.inventoryItems.length) return;
    this.renderInventoryChart();
    this.renderForecastChart();
  }

  private renderInventoryChart() {
    const items = this.inventoryItems.slice(0, 10);
    const labels = items.map(i => i.name);
    const data = items.map(i => i.quantity);

    const ctx = this.inventoryChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      if (this.inventoryChart) this.inventoryChart.destroy();
      this.inventoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Inventory Quantity', data, backgroundColor: '#667eea' }]
        },
        options: {
          responsive: true,
          onClick: (_, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              this.selectProductForForecast(items[index]);
            }
          }
        }
      });
    }
  }

  private renderForecastChart() {
    this.forecastService.getOverallForecast(parseInt(this.forecastPeriod))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          if (res.success && res.data) this.createForecastChart(res.data);
        },
        error: () => this.createForecastChart(this.generateMockForecastData())
      });
  }

  private createForecastChart(forecast: ForecastData) {
    const ctx = this.forecastChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      if (this.forecastChart) this.forecastChart.destroy();
      this.forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: forecast.labels,
          datasets: [{
            label: 'Overall Demand Forecast',
            data: forecast.values,
            borderColor: '#764ba2',
            backgroundColor: 'rgba(118, 75, 162, 0.2)',
            fill: true
          }]
        },
        options: { responsive: true }
      });
    }
  }

  selectProductForForecast(item: InventoryItem) {
    this.selectedProductId = item.id;
    this.selectedProductName = item.name;
    this.showProductForecast = true;
    this.loadProductForecast();
  }

  private loadProductForecast() {
    if (!this.selectedProductId) return;
    this.forecastService.getProductForecast(this.selectedProductId, parseInt(this.productForecastPeriod))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.productForecastData = res.data;
            this.renderProductForecastChart();
          }
        },
        error: () => {
          this.productForecastData = this.generateMockProductForecast();
          this.renderProductForecastChart();
        }
      });
  }

  private renderProductForecastChart() {
    if (!this.productForecastData?.forecast) return;
    const ctx = this.productForecastChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      if (this.productForecastChart) this.productForecastChart.destroy();
      this.productForecastChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.productForecastData.forecast.labels,
          datasets: [{
            label: `${this.selectedProductName} Demand Forecast`,
            data: this.productForecastData.forecast.values,
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.2)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Forecasted Demand' } }
          }
        }
      });
    }
  }

  // UI Event Handlers
  updateForecast() {
    this.renderForecastChart();
  }

  updateProductForecast() {
    this.loadProductForecast();
  }

  closeProductForecast() {
    this.showProductForecast = false;
    this.selectedProductId = null;
    this.selectedProductName = '';
    this.productForecastData = null;
    if (this.productForecastChart) {
      this.productForecastChart.destroy();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Logout handled by interceptor/service
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        window.location.reload();
      }
    });
  }

  // Inventory Management
  filterItems(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredItems = this.inventoryItems.filter(item => {
      const matchesSearch = !term ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.supplier.toLowerCase().includes(term);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'in' && item.status === StockStatus.IN_STOCK) ||
        (this.selectedStatus === 'low' && item.status === StockStatus.LOW_STOCK) ||
        (this.selectedStatus === 'out' && item.status === StockStatus.OUT_OF_STOCK);

      return matchesSearch && matchesStatus;
    });
  }

  resetFilter(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.filteredItems = [...this.inventoryItems];
  }

  addItem() {
    if (!this.newItem.name || !this.newItem.category) {
      this.errorMessage = 'Name and category are required';
      return;
    }

    this.inventoryService.createItem(this.newItem)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.inventoryItems.push(response.data);
            this.newItem = {
              name: '',
              category: '',
              quantity: 0,
              price: 0,
              supplier: '',
              minStockLevel: 10,
              maxStockLevel: 100
            };
            this.showAddItem = false;
            this.filterItems();
            this.loadMetrics(); // Refresh metrics
            this.renderInventoryChart();
            this.errorMessage = '';
          }
        },
        error: (error) => {
          console.error('Error adding item:', error);
          this.errorMessage = 'Failed to add item';
        }
      });
  }

  editItem(item: InventoryItem) {
    this.editingItemId = item.id;
    this.editedItem = { ...item };
  }

  saveEdit() {
    if (this.editingItemId === null) return;

    this.inventoryService.updateItem(this.editingItemId, this.editedItem)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.inventoryItems.findIndex(item => item.id === this.editingItemId);
            if (index !== -1) {
              this.inventoryItems[index] = response.data;
            }
            this.editingItemId = null;
            this.editedItem = {};
            this.filterItems();
            this.loadMetrics();
            this.renderInventoryChart();
            this.errorMessage = '';
          }
        },
        error: (error) => {
          console.error('Error updating item:', error);
          this.errorMessage = 'Failed to update item';
        }
      });
  }

  cancelEdit() {
    this.editingItemId = null;
    this.editedItem = {};
  }

  deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    this.inventoryService.deleteItem(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
            this.filterItems();
            this.loadMetrics();
            this.renderInventoryChart();
            this.errorMessage = '';
          }
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.errorMessage = 'Failed to delete item';
        }
      });
  }

  // Utility methods
  getTotalItems(): number {
    return this.metrics?.totalItems || 0;
  }

  getLowStockCount(): number {
    return this.metrics?.lowStockCount || 0;
  }

  getOutOfStockCount(): number {
    return this.metrics?.outOfStockCount || 0;
  }

  getTotalValue(): number {
    return this.metrics?.totalValue || 0;
  }

  getForecastAccuracy(): number {
    return this.metrics?.forecastAccuracy || 0;
  }

  getStatus(item: InventoryItem): string {
    switch (item.status) {
      case StockStatus.IN_STOCK:
        return 'In Stock';
      case StockStatus.LOW_STOCK:
        return 'Low Stock';
      case StockStatus.OUT_OF_STOCK:
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(item: InventoryItem): string {
    switch (item.status) {
      case StockStatus.IN_STOCK:
        return 'in-stock';
      case StockStatus.LOW_STOCK:
        return 'low-stock';
      case StockStatus.OUT_OF_STOCK:
        return 'out-of-stock';
      default:
        return '';
    }
  }

  getProductForecastInsights(): any[] {
    return this.productForecastData?.insights || [];
  }

  getHighDemandItems() {
    // This should be fetched from backend in real implementation
    return this.inventoryItems
      .filter(item => item.quantity > 50)
      .slice(0, 3)
      .map(item => ({
        id: item.id,
        name: item.name,
        forecast: Math.floor(Math.random() * 50) + 20
      }));
  }

  getReorderRecommendations() {
    return this.inventoryItems
      .filter(item => item.status === StockStatus.LOW_STOCK)
      .map(item => ({
        id: item.id,
        name: item.name,
        recommended: Math.max(item.maxStockLevel || 50, item.quantity * 3)
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

  private destroyCharts() {
    if (this.inventoryChart) this.inventoryChart.destroy();
    if (this.forecastChart) this.forecastChart.destroy();
    if (this.productForecastChart) this.productForecastChart.destroy();
  }

  // Mock fallback generators (same as your original)
  private generateMockForecastData(): ForecastData {
    const days = parseInt(this.forecastPeriod);
    const labels = Array.from({ length: Math.min(days, 30) }, (_, i) => `Day ${i + 1}`);
    const values = labels.map((_, i) =>
      Math.max(0, 50 + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 20 + i * 0.5)
    );
    return {
      labels,
      values,
      period: `${days} days`,
      startDate: new Date().toDateString(),
      endDate: new Date(Date.now() + days * 86400000).toDateString()
    };
  }

  private generateMockProductForecast(): ProductForecast {
    const days = parseInt(this.productForecastPeriod);
    const labels = Array.from({ length: Math.min(days, 30) }, (_, i) => `Day ${i + 1}`);
    const values = labels.map(() => Math.floor(Math.random() * 20) + 5);
    return {
      productId: this.selectedProductId!,
      productName: this.selectedProductName,
      forecast: {
        labels,
        values,
        period: `${days} days`,
        startDate: new Date().toDateString(),
        endDate: new Date(Date.now() + days * 86400000).toDateString()
      },
      insights: [
        { label: 'Average Daily Demand', value: '15.2 units', icon: '📊', description: 'Expected daily demand' },
        { label: 'Peak Demand Expected', value: '25 units', icon: '📈', description: 'Highest single day demand' }
      ]
    };
  }
}
