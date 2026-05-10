import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { z } from 'zod';
import { zodValidator } from '../shared/zod-validator';
import { ExamService } from './exam.service';
import { PatientService } from '../patients/patient.service';
import { Patient } from '../models/patient.model';
import { DICOM_MODALITIES, DICOM_MODALITIES_LABELS } from '../models/exam.model';
import { ErrorMessageComponent } from '../shared/error-message.component';
import { LoadingComponent } from '../shared/loading.component';

const examSchema = z.object({
  patientId: z.string().min(1, { message: 'Selecione um paciente' }),
  modalidade: z.enum(DICOM_MODALITIES, { error: 'modalidade inválida' }),
  dataExame: z.string().refine((date) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return false;
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    return parsedDate >= yesterday;
  }, { message: 'Data do exame não pode ser no passado' })
});

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ErrorMessageComponent, LoadingComponent],
  templateUrl: './exam-form.component.html',
  styleUrl: './exam-form.component.scss'
})
export class ExamFormComponent implements OnInit {
  examForm: FormGroup;
  isSubmitting = false;
  apiError: string | null = null;

  patients: Patient[] = [];
  isLoadingPatients = true;
  modalities = DICOM_MODALITIES;
  modalitiesLabels = DICOM_MODALITIES_LABELS;

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private patientService: PatientService,
    private router: Router
  ) {
    this.examForm = this.fb.group({
      idempotencyKey: [crypto.randomUUID()],
      patientId: ['', [Validators.required, zodValidator(examSchema.shape.patientId)]],
      modalidade: ['', [Validators.required, zodValidator(examSchema.shape.modalidade)]],
      dataExame: ['', [Validators.required, zodValidator(examSchema.shape.dataExame)]]
    });
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.patientService.getPatients(1, 100).subscribe({
      next: (res) => {
        this.patients = res.data;
        this.isLoadingPatients = false;
      },
      error: (err) => {
        this.apiError = 'Erro ao carregar pacientes. ' + err.message;
        this.isLoadingPatients = false;
      }
    });
  }

  onSubmit() {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.apiError = null;

    const payload = { ...this.examForm.value };
    payload.dataExame = new Date(payload.dataExame).toISOString();

    this.examService.createExam(payload).subscribe({
      next: () => {
        this.router.navigate(['/exames']);
      },
      error: (err) => {
        this.apiError = err.message;
        this.isSubmitting = false;
      }
    });
  }
}
