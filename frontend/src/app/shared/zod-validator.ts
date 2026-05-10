import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ZodSchema, ZodError } from 'zod';

export function zodValidator(schema: ZodSchema): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const result = schema.safeParse(control.value);
    if (result.success) {
      return null;
    }

    const errors: ValidationErrors = {};
    const zodError = result.error as ZodError;

    if (zodError.issues.length > 0) {
      errors['zodError'] = zodError.issues[0].message;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}
