import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  products: `${environment.apiUrl}/products`,
  product: (id: string) => `${environment.apiUrl}/products/${id}`,
  productVerification: (id: string) => `${environment.apiUrl}/products/verification/${id}`,
};
