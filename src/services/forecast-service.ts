import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ForecastData {
  labels: string[];
  values: number[];
  period: string;
  startDate: string;
  endDate: string;
}

export interface ForecastInsight {
  label: string;
  value: string;
  icon: string;
  description?: string;
}

export interface ProductForecast {
  productId: number;
  productName: string;
  forecast: ForecastData;
  insights: ForecastInsight[];
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
export class HttpForecastService {
  private readonly API_URL = `${environment.apiUrl}/api/forecast`;

  constructor(private http: HttpClient) {}

  getOverallForecast(days: number = 30): Observable<ApiResponse<ForecastData>> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ApiResponse<ForecastData>>(`${this.API_URL}/overall`, { params });
  }

  getProductForecast(productId: number, days: number = 30): Observable<ApiResponse<ProductForecast>> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ApiResponse<ProductForecast>>(`${this.API_URL}/product/${productId}`, { params });
  }
}
