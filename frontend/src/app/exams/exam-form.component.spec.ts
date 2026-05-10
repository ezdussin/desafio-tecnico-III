import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamFormComponent } from './exam-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExamService } from './exam.service';
import { PatientService } from '../patients/patient.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('ExamFormComponent', () => {
  let component: ExamFormComponent;
  let fixture: ComponentFixture<ExamFormComponent>;
  let examService: any;
  let patientService: any;

  beforeEach(async () => {
    const examSpy = { createExam: vi.fn() };
    const patientSpy = { getPatients: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        ExamFormComponent,
        ReactiveFormsModule,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: ExamService, useValue: examSpy },
        { provide: PatientService, useValue: patientSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExamFormComponent);
    component = fixture.componentInstance;
    examService = TestBed.inject(ExamService);
    patientService = TestBed.inject(PatientService);

    patientService.getPatients.mockReturnValue(of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error message on API failure', () => {
    component.patients = [{ id: '1', nome: 'João', documento: '123', dataNascimento: '2004-01-01' }];
    component.isLoadingPatients = false;
    fixture.detectChanges();

    component.examForm.setValue({
      patientId: '1',
      modalidade: 'CT',
      dataExame: '2023-01-01T10:00',
      idempotencyKey: 'key-1'
    });

    examService.createExam.mockReturnValue(throwError(() => new Error('API Error')));

    component.onSubmit();
    fixture.detectChanges();

    expect(component.apiError).toBe('API Error');
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-error-message')).toBeTruthy();
  });

  it('should show error when patient is not selected and touched', () => {
    component.isLoadingPatients = false;
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#patientId');
    select.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('.error-text');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toContain('Selecione um paciente');
  });

  it('should enable submit button only when form is valid', () => {
    component.isLoadingPatients = false;
    component.patients = [{ id: '1', nome: 'João', documento: '123', dataNascimento: '2004-01-01' }];
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBeTruthy();

    component.examForm.patchValue({
      patientId: '1',
      modalidade: 'MR',
      dataExame: '2023-10-10T14:30'
    });
    fixture.detectChanges();

    expect(submitBtn.disabled).toBeFalsy();
  });

  it('should mark all fields as touched on invalid submit', () => {
    component.isLoadingPatients = false;
    fixture.detectChanges();

    component.onSubmit();

    expect(component.examForm.get('patientId')?.touched).toBeTruthy();
    expect(component.examForm.get('modalidade')?.touched).toBeTruthy();
    expect(component.examForm.get('dataExame')?.touched).toBeTruthy();
  });

  it('should update form value when select changes', () => {
    component.isLoadingPatients = false;
    component.patients = [{ id: '1', nome: 'João', documento: '123', dataNascimento: '2004-01-01' }];
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#modalidade');
    select.value = 'US';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.examForm.get('modalidade')?.value).toBe('US');
  });

  it('should show loading component while loading patients', () => {
    component.isLoadingPatients = true;
    fixture.detectChanges();

    const loadingComponent = fixture.nativeElement.querySelector('app-loading');
    expect(loadingComponent).toBeTruthy();
  });

  it('should be invalid if exam date is in the past', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const dateString = pastDate.toISOString().substring(0, 16); // datetime-local format

    component.examForm.patchValue({
      patientId: '1',
      modalidade: 'CT',
      dataExame: dateString
    });
    fixture.detectChanges();

    expect(component.examForm.get('dataExame')?.invalid).toBeTruthy();
    expect(component.examForm.get('dataExame')?.errors?.['zodError']).toContain('Data do exame não pode ser no passado');
  });
});
