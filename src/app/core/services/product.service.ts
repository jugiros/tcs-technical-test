import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Product } from '../models/product.model';

interface ProductListResponse {
  data: Product[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ProductListResponse>(API_ENDPOINTS.products)
      .pipe(map((response) => response.data));
  }
}
