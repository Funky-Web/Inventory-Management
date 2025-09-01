import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  minStockLevel: number;
  maxStockLevel: number;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateInventoryItem {
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  minStockLevel?: number;
  maxStockLevel?: number;
}

export interface UpdateInventoryItem {
  name?: string;
  category?: string;
  quantity?: number;
  price?: number;
  supplier?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
}

export interface InventoryMetrics {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  forecastAccuracy: number;
}

export interface InventoryFilter {
  searchTerm?: string;
  category?: string;
  supplier?: string;
  status?: StockStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class HttpInventoryService {
  private readonly API_URL = `${environment.apiUrl}/api/inventory`;

  constructor(private http: HttpClient) {}

  getAllItems(filter?: InventoryFilter): Observable<ApiResponse<PageResponse<InventoryItem>>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
      if (filter.category) params = params.set('category', filter.category);
      if (filter.supplier) params = params.set('supplier', filter.supplier);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size !== undefined) params = params.set('size', filter.size.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
    }

    return this.http.get<ApiResponse<PageResponse<InventoryItem>>>(this.API_URL, { params });
  }

  getItemById(id: number): Observable<ApiResponse<InventoryItem>> {
    return this.http.get<ApiResponse<InventoryItem>>(`${this.API_URL}/${id}`);
  }

  createItem(item: CreateInventoryItem): Observable<ApiResponse<InventoryItem>> {
    return this.http.post<ApiResponse<InventoryItem>>(this.API_URL, item);
  }

  updateItem(id: number, item: UpdateInventoryItem): Observable<ApiResponse<InventoryItem>> {
    return this.http.put<ApiResponse<InventoryItem>>(`${this.API_URL}/${id}`, item);
  }

  deleteItem(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  getMetrics(): Observable<ApiResponse<InventoryMetrics>> {
    return this.http.get<ApiResponse<InventoryMetrics>>(`${this.API_URL}/metrics`);
  }

  getLowStockItems(): Observable<ApiResponse<InventoryItem[]>> {
    return this.http.get<ApiResponse<InventoryItem[]>>(`${this.API_URL}/low-stock`);
  }

  getOutOfStockItems(): Observable<ApiResponse<InventoryItem[]>> {
    return this.http.get<ApiResponse<InventoryItem[]>>(`${this.API_URL}/out-of-stock`);
  }

  getCategories(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/categories`);
  }

  getSuppliers(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/suppliers`);
  }

  getReorderRecommendations(): Observable<ApiResponse<InventoryItem[]>> {
    return this.http.get<ApiResponse<InventoryItem[]>>(`${this.API_URL}/reorder-recommendations`);
  }
}
