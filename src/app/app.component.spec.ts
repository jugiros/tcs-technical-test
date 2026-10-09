import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(AppComponent);
  });

  it('se crea correctamente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra el encabezado "BANCO"', () => {
    fixture.detectChanges();
    const title: HTMLElement = fixture.nativeElement.querySelector('.app-header__title');
    expect(title.textContent).toContain('BANCO');
  });
});
