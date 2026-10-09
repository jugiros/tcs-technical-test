import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of } from 'rxjs';
import { ProductService } from '../services/product.service';

export function idExistsValidator(productService: ProductService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return productService.checkProductIdExists(control.value).pipe(
      map((exists) => (exists ? { idExists: true } : null)),
      catchError(() => of(null)),
    );
  };
}
