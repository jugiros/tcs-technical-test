import { FormControl, FormGroup } from '@angular/forms';
import {
  addOneYearToIsoDate,
  minDateTodayValidator,
  oneYearAfterValidator,
  todayIsoDate,
} from './date.validators';

describe('todayIsoDate', () => {
  it('devuelve la fecha actual en formato ISO (YYYY-MM-DD)', () => {
    const result = todayIsoDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('addOneYearToIsoDate', () => {
  it('suma exactamente un año a una fecha ISO', () => {
    expect(addOneYearToIsoDate('2025-01-01')).toBe('2026-01-01');
  });

  it('maneja correctamente el 29 de febrero en años bisiestos', () => {
    expect(addOneYearToIsoDate('2024-02-29')).toBe('2025-03-01');
  });
});

describe('minDateTodayValidator', () => {
  it('no reporta error cuando el control está vacío', () => {
    const control = new FormControl('');
    expect(minDateTodayValidator(control)).toBeNull();
  });

  it('no reporta error cuando la fecha es igual a hoy', () => {
    const control = new FormControl(todayIsoDate());
    expect(minDateTodayValidator(control)).toBeNull();
  });

  it('no reporta error cuando la fecha es futura', () => {
    const control = new FormControl('2999-01-01');
    expect(minDateTodayValidator(control)).toBeNull();
  });

  it('reporta error cuando la fecha es anterior a hoy', () => {
    const control = new FormControl('2000-01-01');
    expect(minDateTodayValidator(control)).toEqual({ minDateToday: true });
  });
});

describe('oneYearAfterValidator', () => {
  const validator = oneYearAfterValidator('date_release', 'date_revision');

  it('no reporta error cuando algún campo está vacío', () => {
    const group = new FormGroup({
      date_release: new FormControl(''),
      date_revision: new FormControl(''),
    });
    expect(validator(group)).toBeNull();
  });

  it('no reporta error cuando date_revision es exactamente un año posterior', () => {
    const group = new FormGroup({
      date_release: new FormControl('2025-05-10'),
      date_revision: new FormControl('2026-05-10'),
    });
    expect(validator(group)).toBeNull();
  });

  it('reporta error cuando date_revision no es un año posterior', () => {
    const group = new FormGroup({
      date_release: new FormControl('2025-05-10'),
      date_revision: new FormControl('2025-06-10'),
    });
    expect(validator(group)).toEqual({ oneYearAfter: true });
  });
});
