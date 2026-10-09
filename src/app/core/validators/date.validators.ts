import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addOneYearToIsoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year + 1, month - 1, day);
  const resultMonth = String(date.getMonth() + 1).padStart(2, '0');
  const resultDay = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${resultMonth}-${resultDay}`;
}

export function minDateTodayValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null;
  }
  return value < todayIsoDate() ? { minDateToday: true } : null;
}

export function oneYearAfterValidator(
  releaseControlName: string,
  revisionControlName: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const release = group.get(releaseControlName)?.value as string;
    const revision = group.get(revisionControlName)?.value as string;

    if (!release || !revision) {
      return null;
    }

    return revision === addOneYearToIsoDate(release) ? null : { oneYearAfter: true };
  };
}
