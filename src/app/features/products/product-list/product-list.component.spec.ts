import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;
  let productService: jest.Mocked<Pick<ProductService, 'getProducts' | 'deleteProduct'>>;

  const products: Product[] = [
    {
      id: 'trj-crd',
      name: 'Tarjeta de Crédito',
      description: 'Tarjeta de consumo bajo la modalidad de crédito',
      logo: 'https://example.com/logo.png',
      date_release: '2025-01-01',
      date_revision: '2026-01-01',
    },
    {
      id: 'cta-ahorro',
      name: 'Cuenta de Ahorros',
      description: 'Cuenta de ahorros sin costo de mantenimiento',
      logo: 'https://example.com/logo2.png',
      date_release: '2025-02-01',
      date_revision: '2026-02-01',
    },
  ];

  function setup(getProductsResult = of(products)): void {
    productService = {
      getProducts: jest.fn().mockReturnValue(getProductsResult),
      deleteProduct: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [provideRouter([]), { provide: ProductService, useValue: productService }],
    });

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('carga los productos al inicializar', () => {
    setup();

    expect(productService.getProducts).toHaveBeenCalled();
    expect((component as any).products()).toEqual(products);
    expect((component as any).loading()).toBe(false);
  });

  it('muestra un mensaje de error si la carga de productos falla', () => {
    setup(throwError(() => new Error('network error')));

    expect((component as any).errorMessage()).toContain('No se pudieron cargar');
    expect((component as any).loading()).toBe(false);
  });

  it('filtra productos por nombre o descripción con la búsqueda', () => {
    setup();

    (component as any).onSearchInput({ target: { value: 'ahorro' } } as unknown as Event);

    expect((component as any).filteredProducts()).toEqual([products[1]]);
  });

  it('devuelve todos los productos cuando la búsqueda está vacía', () => {
    setup();

    (component as any).onSearchInput({ target: { value: '' } } as unknown as Event);

    expect((component as any).filteredProducts()).toEqual(products);
  });

  it('limita los productos mostrados según la cantidad de registros seleccionada', () => {
    setup();

    (component as any).onPageSizeChange({ target: { value: '1' } } as unknown as Event);

    expect((component as any).displayedProducts()).toEqual([products[0]]);
  });

  it('calcula las iniciales de un nombre de producto', () => {
    setup();

    expect((component as any).initials('Tarjeta de Crédito')).toBe('TD');
    expect((component as any).initials('Cuenta')).toBe('C');
  });

  it('oculta la imagen del logo cuando falla la carga', () => {
    setup();

    const img = { style: { display: '' } } as unknown as HTMLImageElement;
    (component as any).hideBrokenLogo({ target: img } as unknown as Event);

    expect(img.style.display).toBe('none');
  });

  it('abre y cierra el menú contextual calculando su posición', () => {
    setup();

    const button = {
      getBoundingClientRect: () => ({ bottom: 100, right: 200 }),
    } as unknown as HTMLElement;
    const event = { stopPropagation: jest.fn(), currentTarget: button } as unknown as Event;

    (component as any).toggleMenu('trj-crd', event);

    expect((component as any).openMenuId()).toBe('trj-crd');
    expect((component as any).menuPosition()).toEqual({ top: 104, left: 200 });

    (component as any).toggleMenu('trj-crd', event);

    expect((component as any).openMenuId()).toBeNull();
    expect((component as any).menuPosition()).toBeNull();
  });

  it('abre el modal de confirmación de eliminación con el producto seleccionado', () => {
    setup();

    const event = { stopPropagation: jest.fn() } as unknown as Event;
    (component as any).openDeleteModal(products[0], event);

    expect((component as any).productToDelete()).toEqual(products[0]);
    expect((component as any).openMenuId()).toBeNull();
  });

  it('cancela la eliminación cerrando el modal sin llamar al servicio', () => {
    setup();

    (component as any).productToDelete.set(products[0]);
    (component as any).cancelDelete();

    expect((component as any).productToDelete()).toBeNull();
    expect(productService.deleteProduct).not.toHaveBeenCalled();
  });

  it('elimina el producto y lo remueve de la lista al confirmar', () => {
    setup();
    productService.deleteProduct.mockReturnValue(of(undefined));

    (component as any).productToDelete.set(products[0]);
    (component as any).confirmDelete();

    expect(productService.deleteProduct).toHaveBeenCalledWith('trj-crd');
    expect((component as any).products()).toEqual([products[1]]);
    expect((component as any).productToDelete()).toBeNull();
    expect((component as any).deleting()).toBe(false);
  });

  it('muestra un error si la eliminación falla', () => {
    setup();
    productService.deleteProduct.mockReturnValue(throwError(() => new Error('network error')));

    (component as any).productToDelete.set(products[0]);
    (component as any).confirmDelete();

    expect((component as any).deleteError()).toContain('No se pudo eliminar');
    expect((component as any).deleting()).toBe(false);
  });
});
