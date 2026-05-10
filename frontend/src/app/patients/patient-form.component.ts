import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { z } from 'zod';
import { zodValidator } from '../shared/zod-validator';
import { PatientService } from './patient.service';
import { ErrorMessageComponent } from '../shared/error-message.component';

const patientSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
  documento: z.string().refine(val => val.replace(/\D/g, '').length === 11, { message: 'O CPF deve conter exatamente 11 números' }),
  dataNascimento: z.string().refine((date) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return parsedDate <= today;
  }, { message: 'Data de nascimento não pode ser no futuro' })
});

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ErrorMessageComponent],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss'
})
export class PatientFormComponent {
  patientForm: FormGroup;
  isSubmitting = false;
  apiError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      nome: ['', [Validators.required, zodValidator(patientSchema.shape.nome)]],
      documento: ['', [Validators.required, zodValidator(patientSchema.shape.documento)]],
      dataNascimento: ['', [Validators.required, zodValidator(patientSchema.shape.dataNascimento)]]
    });
  }

  onDocumentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    input.value = value;
    this.patientForm.get('documento')?.setValue(value, { emitEvent: false });
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.apiError = null;

    const payload = { ...this.patientForm.value };
    payload.documento = payload.documento.replace(/\D/g, '');

    this.patientService.createPatient(payload).subscribe({
      next: () => {
        this.router.navigate(['/pacientes']);
      },
      error: (err) => {
        this.apiError = err.message;
        this.isSubmitting = false;
      }
    });
  }
}
