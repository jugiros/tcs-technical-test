import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pageSizeOptions = [5, 10, 20] as const;
  protected readonly skeletonRows = Array.from({ length: 5 });
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly pageSize = signal<number>(this.pageSizeOptions[0]);

  protected readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const products = this.products();

    if (!term) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term),
    );
  });

  protected readonly displayedProducts = computed(() =>
    this.filteredProducts().slice(0, this.pageSize()),
  );

  protected readonly openMenuId = signal<string | null>(null);
  protected readonly productToDelete = signal<Product | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  constructor() {
    this.loadProducts();
  }

  protected toggleMenu(productId: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === productId ? null : productId);
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected openDeleteModal(product: Product, event: Event): void {
    event.stopPropagation();
    this.closeMenu();
    this.deleteError.set(null);
    this.productToDelete.set(product);
  }

  protected cancelDelete(): void {
    this.productToDelete.set(null);
  }

  protected confirmDelete(): void {
    const product = this.productToDelete();
    if (!product) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);

    this.productService
      .deleteProduct(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.products.set(this.products().filter((item) => item.id !== product.id));
          this.deleting.set(false);
          this.productToDelete.set(null);
        },
        error: () => {
          this.deleteError.set(
            'No se pudo eliminar el producto financiero. Intenta nuevamente más tarde.',
          );
          this.deleting.set(false);
        },
      });
  }

  protected onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onPageSizeChange(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
  }

  protected initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }

  protected hideBrokenLogo(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productService
      .getProducts()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'No se pudieron cargar los productos financieros. Intenta nuevamente más tarde.',
          );
          this.loading.set(false);
        },
      });
  }
}
