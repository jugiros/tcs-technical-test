import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControlStatus,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import {
  addOneYearToIsoDate,
  minDateTodayValidator,
  oneYearAfterValidator,
} from '../../../core/validators/date.validators';
import { idExistsValidator } from '../../../core/validators/id-exists.validator';

type ProductFormControlName = 'id' | 'name' | 'description' | 'logo' | 'date_release' | 'date_revision';

const ERROR_MESSAGES: Record<string, string> = {
  required: 'Este campo es requerido!',
  minlength: 'El valor ingresado es demasiado corto.',
  maxlength: 'El valor ingresado es demasiado largo.',
  idExists: 'ID no válido!',
  minDateToday: 'La fecha debe ser igual o mayor a la fecha actual.',
};

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly productId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = !!this.productId;

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly loadError = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      id: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        asyncValidators: [idExistsValidator(this.productService)],
        updateOn: 'blur',
      }),
      name: this.fb.control('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),
      description: this.fb.control('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
      logo: this.fb.control('', [Validators.required]),
      date_release: this.fb.control('', [Validators.required, minDateTodayValidator]),
      date_revision: this.fb.control('', [Validators.required]),
    },
    { validators: [oneYearAfterValidator('date_release', 'date_revision')] },
  );

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status as FormControlStatus,
  });

  protected readonly canSubmit = computed(
    () => this.formStatus() === 'VALID' && !this.submitting(),
  );

  private originalProduct: Product | null = null;

  constructor() {
    this.form.controls.date_revision.disable();

    this.form.controls.date_release.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.form.controls.date_revision.setValue(value ? addOneYearToIsoDate(value) : '');
    });

    if (this.isEditMode && this.productId) {
      this.form.controls.id.disable();
      this.loadProduct(this.productId);
    }
  }

  protected hasError(controlName: ProductFormControlName): boolean {
    this.formStatus();
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected errorMessage(controlName: ProductFormControlName): string | null {
    const control = this.form.controls[controlName];
    if (!control.errors) {
      return null;
    }
    const [firstErrorKey] = Object.keys(control.errors);
    return ERROR_MESSAGES[firstErrorKey] ?? 'Valor inválido.';
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const rawValue = this.form.getRawValue();
    const { id, ...payload } = rawValue;
    const request = this.isEditMode
      ? this.productService.updateProduct(id, payload)
      : this.productService.createProduct(rawValue);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.submitError.set(
          'No se pudo guardar el producto financiero. Intenta nuevamente más tarde.',
        );
        this.submitting.set(false);
      },
    });
  }

  protected onReset(): void {
    if (this.originalProduct) {
      this.form.patchValue(this.originalProduct);
      return;
    }
    this.form.reset();
    this.form.controls.date_revision.disable();
  }

  private loadProduct(id: string): void {
    this.productService
      .getProductById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          if (!product) {
            this.loadError.set('No se encontró el producto financiero solicitado.');
            return;
          }
          this.originalProduct = product;
          this.form.patchValue(product);
        },
        error: () => {
          this.loadError.set(
            'No se pudo cargar el producto financiero. Intenta nuevamente más tarde.',
          );
        },
      });
  }
}
