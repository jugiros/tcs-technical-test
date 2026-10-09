import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductFormComponent } from './product-form.component';

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;
  let productService: jest.Mocked<
    Pick<ProductService, 'checkProductIdExists' | 'createProduct' | 'updateProduct' | 'getProductById'>
  >;
  let router: { navigate: jest.Mock };

  const product: Product = {
    id: 'trj-crd',
    name: 'Tarjeta de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://example.com/logo.png',
    date_release: '2999-01-01',
    date_revision: '3000-01-01',
  };

  function setup(routeId: string | null = null): void {
    productService = {
      checkProductIdExists: jest.fn().mockReturnValue(of(false)),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      getProductById: jest.fn(),
    };
    router = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(routeId ? { id: routeId } : {}) },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillValidForm(): void {
    const form = (component as any).form;
    form.controls.id.setValue('nuevo-id');
    form.controls.name.setValue('Nombre válido');
    form.controls.description.setValue('Descripción con más de diez caracteres');
    form.controls.logo.setValue('https://example.com/logo.png');
    form.controls.date_release.setValue('2999-01-01');
  }

  describe('modo creación', () => {
    it('no está en modo edición y el campo id permanece habilitado', () => {
      setup();

      expect((component as any).isEditMode).toBe(false);
      expect((component as any).form.controls.id.disabled).toBe(false);
    });

    it('reporta error "requerido" en campos vacíos tocados', () => {
      setup();

      const nameControl = (component as any).form.controls.name;
      nameControl.markAsTouched();

      expect((component as any).hasError('name')).toBe(true);
      expect((component as any).errorMessage('name')).toBe('Este campo es requerido!');
    });

    it('calcula automáticamente date_revision un año después de date_release', () => {
      setup();

      (component as any).form.controls.date_release.setValue('2030-06-15');

      expect((component as any).form.controls.date_revision.value).toBe('2031-06-15');
    });

    it('reporta error cuando la fecha de liberación es anterior a hoy', () => {
      setup();

      const control = (component as any).form.controls.date_release;
      control.setValue('2000-01-01');
      control.markAsTouched();

      expect((component as any).hasError('date_release')).toBe(true);
      expect((component as any).errorMessage('date_release')).toContain(
        'igual o mayor a la fecha actual',
      );
    });

    it('reporta ID no válido cuando el identificador ya existe', (done) => {
      setup();
      productService.checkProductIdExists.mockReturnValue(of(true));

      const control = (component as any).form.controls.id;
      control.setValue('ya-existe');

      setTimeout(() => {
        expect(control.errors).toEqual({ idExists: true });
        expect((component as any).errorMessage('id')).toBe('ID no válido!');
        done();
      });
    });

    it('no envía el formulario cuando es inválido', () => {
      setup();

      (component as any).onSubmit();

      expect(productService.createProduct).not.toHaveBeenCalled();
      expect((component as any).form.controls.name.touched).toBe(true);
    });

    it('crea el producto y navega al listado cuando el formulario es válido', () => {
      setup();
      productService.createProduct.mockReturnValue(of(product));
      fillValidForm();

      (component as any).onSubmit();

      expect(productService.createProduct).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('muestra un error si la creación del producto falla', () => {
      setup();
      productService.createProduct.mockReturnValue(throwError(() => new Error('network error')));
      fillValidForm();

      (component as any).onSubmit();

      expect((component as any).submitError()).toContain('No se pudo guardar');
      expect((component as any).submitting()).toBe(false);
    });

    it('reinicia el formulario a sus valores vacíos', () => {
      setup();
      fillValidForm();

      (component as any).onReset();

      expect((component as any).form.controls.name.value).toBe('');
    });
  });

  describe('modo edición', () => {
    it('deshabilita el campo id y carga los datos del producto', () => {
      productService = {
        checkProductIdExists: jest.fn().mockReturnValue(of(false)),
        createProduct: jest.fn(),
        updateProduct: jest.fn(),
        getProductById: jest.fn().mockReturnValue(of(product)),
      };
      router = { navigate: jest.fn() };

      TestBed.configureTestingModule({
        imports: [ProductFormComponent],
        providers: [
          { provide: ProductService, useValue: productService },
          { provide: Router, useValue: router },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: convertToParamMap({ id: product.id }) } },
          },
        ],
      });

      fixture = TestBed.createComponent(ProductFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect((component as any).isEditMode).toBe(true);
      expect((component as any).form.controls.id.disabled).toBe(true);
      expect((component as any).form.controls.name.value).toBe(product.name);
    });

    it('muestra un error cuando el producto a editar no existe', () => {
      productService = {
        checkProductIdExists: jest.fn().mockReturnValue(of(false)),
        createProduct: jest.fn(),
        updateProduct: jest.fn(),
        getProductById: jest.fn().mockReturnValue(of(undefined)),
      };
      router = { navigate: jest.fn() };

      TestBed.configureTestingModule({
        imports: [ProductFormComponent],
        providers: [
          { provide: ProductService, useValue: productService },
          { provide: Router, useValue: router },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: convertToParamMap({ id: 'no-existe' }) } },
          },
        ],
      });

      fixture = TestBed.createComponent(ProductFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect((component as any).loadError()).toContain('No se encontró');
    });

    it('actualiza el producto excluyendo el id del cuerpo de la petición', () => {
      productService = {
        checkProductIdExists: jest.fn().mockReturnValue(of(false)),
        createProduct: jest.fn(),
        updateProduct: jest.fn().mockReturnValue(of(product)),
        getProductById: jest.fn().mockReturnValue(of(product)),
      };
      router = { navigate: jest.fn() };

      TestBed.configureTestingModule({
        imports: [ProductFormComponent],
        providers: [
          { provide: ProductService, useValue: productService },
          { provide: Router, useValue: router },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: convertToParamMap({ id: product.id }) } },
          },
        ],
      });

      fixture = TestBed.createComponent(ProductFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      (component as any).onSubmit();

      expect(productService.updateProduct).toHaveBeenCalledWith(
        product.id,
        expect.not.objectContaining({ id: expect.anything() }),
      );
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
