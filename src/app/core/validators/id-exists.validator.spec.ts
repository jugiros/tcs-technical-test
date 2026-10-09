import { FormControl } from '@angular/forms';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ProductService } from '../services/product.service';
import { idExistsValidator } from './id-exists.validator';

describe('idExistsValidator', () => {
  function createProductServiceMock(): jest.Mocked<Pick<ProductService, 'checkProductIdExists'>> {
    return {
      checkProductIdExists: jest.fn(),
    };
  }

  it('no consulta el backend cuando el control está vacío', async () => {
    const productService = createProductServiceMock();
    const validator = idExistsValidator(productService as unknown as ProductService);

    const result = await firstValueFrom(validator(new FormControl('')) as ReturnType<typeof validator>);

    expect(result).toBeNull();
    expect(productService.checkProductIdExists).not.toHaveBeenCalled();
  });

  it('reporta idExists cuando el backend confirma que el ID ya existe', async () => {
    const productService = createProductServiceMock();
    productService.checkProductIdExists.mockReturnValue(of(true));
    const validator = idExistsValidator(productService as unknown as ProductService);

    const result = await firstValueFrom(validator(new FormControl('abc')) as ReturnType<typeof validator>);

    expect(result).toEqual({ idExists: true });
  });

  it('no reporta error cuando el backend confirma que el ID no existe', async () => {
    const productService = createProductServiceMock();
    productService.checkProductIdExists.mockReturnValue(of(false));
    const validator = idExistsValidator(productService as unknown as ProductService);

    const result = await firstValueFrom(validator(new FormControl('abc')) as ReturnType<typeof validator>);

    expect(result).toBeNull();
  });

  it('no bloquea el formulario si la verificación falla por un error de red', async () => {
    const productService = createProductServiceMock();
    productService.checkProductIdExists.mockReturnValue(throwError(() => new Error('network error')));
    const validator = idExistsValidator(productService as unknown as ProductService);

    const result = await firstValueFrom(validator(new FormControl('abc')) as ReturnType<typeof validator>);

    expect(result).toBeNull();
  });
});
