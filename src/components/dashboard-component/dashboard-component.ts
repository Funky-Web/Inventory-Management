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
  isSidebarCollapsed = false;
  activeTab = 'dashboard';
  errorMessage = '';
  successMessage = '';
  showNotifications = false;

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

  // Progress tracking
  loadingProgress = 0;
  operationInProgress = false;

  private destroy$ = new Subject<void>();

  constructor(
    private inventoryService: HttpInventoryService,
    private authService: HttpAuthService,
    private forecastService: HttpForecastService
  ) {}

  ngOnInit() {
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
    this.loadingProgress = 0;
    this.errorMessage = '';

    try {
      const tasks = [
        this.loadInventoryItems(),
        this.loadMetrics(),
        this.loadCategories(),
        this.loadSuppliers()
      ];

      for (let i = 0; i < tasks.length; i++) {
        await tasks[i];
        this.loadingProgress = ((i + 1) / tasks.length) * 100;
      }

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

  // Sidebar and navigation
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
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
          datasets: [{
            label: 'Current Stock',
            data,
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
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
            label: 'Demand Forecast',
            data: forecast.values,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  // Modal and UI operations
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
            label: `${this.selectedProductName} Forecast`,
            data: this.productForecastData.forecast.values,
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Forecasted Demand' } }
          }
        }
      });
    }
  }

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
    this.operationInProgress = true;
    this.authService.logout().subscribe({
      next: () => {
        this.operationInProgress = false;
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.operationInProgress = false;
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
      this.showError('Name and category are required');
      return;
    }

    this.operationInProgress = true;
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
            this.loadMetrics();
            this.renderInventoryChart();
            this.showSuccess('Item added successfully');
            this.operationInProgress = false;
          }
        },
        error: (error) => {
          console.error('Error adding item:', error);
          this.showError('Failed to add item');
          this.operationInProgress = false;
        }
      });
  }

  editItem(item: InventoryItem) {
    this.editingItemId = item.id;
    this.editedItem = { ...item };
  }

  saveEdit() {
    if (this.editingItemId === null) return;

    this.operationInProgress = true;
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
            this.showSuccess('Item updated successfully');
            this.operationInProgress = false;
          }
        },
        error: (error) => {
          console.error('Error updating item:', error);
          this.showError('Failed to update item');
          this.operationInProgress = false;
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

    this.operationInProgress = true;
    this.inventoryService.deleteItem(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
            this.filterItems();
            this.loadMetrics();
            this.renderInventoryChart();
            this.showSuccess('Item deleted successfully');
            this.operationInProgress = false;
          }
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.showError('Failed to delete item');
          this.operationInProgress = false;
        }
      });
  }

  // Notification methods
  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
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
        return 'status-success';
      case StockStatus.LOW_STOCK:
        return 'status-warning';
      case StockStatus.OUT_OF_STOCK:
        return 'status-danger';
      default:
        return '';
    }
  }

  getProductForecastInsights(): any[] {
    return this.productForecastData?.insights || [];
  }

  getHighDemandItems() {
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

  private destroyCharts() {
    if (this.inventoryChart) this.inventoryChart.destroy();
    if (this.forecastChart) this.forecastChart.destroy();
    if (this.productForecastChart) this.productForecastChart.destroy();
  }

  // Mock data generators
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
        { label: 'Daily Average', value: '15.2 units', icon: '📊' },
        { label: 'Peak Expected', value: '25 units', icon: '📈' }
      ]
    };
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


  getPageTitle(): string {
    switch (this.activeTab) {
      case 'inventory':
        return 'Inventory Management';
      case 'analytics':
        return 'Analytics Overview';
      case 'reports':
        return 'Reports';
      default:
        return 'Dashboard';
    }
  }

}
