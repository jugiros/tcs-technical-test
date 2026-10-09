import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const product: Product = {
    id: 'trj-crd',
    name: 'Tarjeta de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://example.com/logo.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getProducts obtiene la lista de productos desde /bp/products', () => {
    let result: Product[] | undefined;

    service.getProducts().subscribe((products) => (result = products));

    const req = httpMock.expectOne('/bp/products');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [product] });

    expect(result).toEqual([product]);
  });

  it('checkProductIdExists consulta el endpoint de verificación', () => {
    let result: boolean | undefined;

    service.checkProductIdExists('trj-crd').subscribe((exists) => (result = exists));

    const req = httpMock.expectOne('/bp/products/verification/trj-crd');
    expect(req.request.method).toBe('GET');
    req.flush(true);

    expect(result).toBe(true);
  });

  it('getProductById busca el producto dentro del listado completo', () => {
    let result: Product | undefined;

    service.getProductById('trj-crd').subscribe((found) => (result = found));

    const req = httpMock.expectOne('/bp/products');
    req.flush({ data: [product] });

    expect(result).toEqual(product);
  });

  it('getProductById devuelve undefined cuando el producto no existe', () => {
    let result: Product | undefined;

    service.getProductById('no-existe').subscribe((found) => (result = found));

    const req = httpMock.expectOne('/bp/products');
    req.flush({ data: [product] });

    expect(result).toBeUndefined();
  });

  it('createProduct envía un POST con el producto y devuelve la respuesta', () => {
    let result: Product | undefined;

    service.createProduct(product).subscribe((created) => (result = created));

    const req = httpMock.expectOne('/bp/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(product);
    req.flush({ message: 'Product added successfully', data: product });

    expect(result).toEqual(product);
  });

  it('updateProduct envía un PUT al endpoint del producto', () => {
    const { id, ...payload } = product;
    let result: Product | undefined;

    service.updateProduct(id, payload).subscribe((updated) => (result = updated));

    const req = httpMock.expectOne(`/bp/products/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ message: 'Product updated successfully', data: product });

    expect(result).toEqual(product);
  });

  it('deleteProduct envía un DELETE al endpoint del producto', () => {
    let completed = false;

    service.deleteProduct(product.id).subscribe(() => (completed = true));

    const req = httpMock.expectOne(`/bp/products/${product.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Product removed successfully' });

    expect(completed).toBe(true);
  });
});
