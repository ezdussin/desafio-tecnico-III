import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { vi } from 'vitest';
import { PatientFormComponent } from './patient-form.component';
import { PatientService } from './patient.service';

describe('PatientFormComponent', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;

  beforeEach(async () => {
    const patientSpy = { createPatient: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        PatientFormComponent,
        ReactiveFormsModule,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: PatientService, useValue: patientSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate CPF length', () => {
    const control = component.patientForm.get('documento');
    control?.setValue('123');
    expect(control?.invalid).toBeTruthy();

    control?.setValue('123.456.789-01'); // With mask
    expect(control?.valid).toBeTruthy();
  });

  it('should show error message when name is too short and touched', async () => {
    const nameInput = fixture.nativeElement.querySelector('#name');
    nameInput.value = 'Ab';
    nameInput.dispatchEvent(new Event('input'));
    nameInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('.error-text');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toContain('Nome deve ter no mínimo 3 caracteres');
  });

  it('should apply CPF mask while typing', () => {
    const docInput = fixture.nativeElement.querySelector('#document');
    docInput.value = '12345678901';
    docInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(docInput.value).toBe('123.456.789-01');
    expect(component.patientForm.get('documento')?.value).toBe('123.456.789-01');
  });

  it('should disable submit button when form is invalid', () => {
    component.patientForm.patchValue({
      nome: '',
      documento: '',
      dataNascimento: ''
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    component.patientForm.patchValue({
      nome: 'João da Silva',
      documento: '123.456.789-01',
      dataNascimento: '1990-01-01'
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBeFalsy();
  });

  it('should mark all fields as touched on submit attempt with invalid form', () => {
    component.onSubmit();
    
    expect(component.patientForm.get('nome')?.touched).toBeTruthy();
    expect(component.patientForm.get('documento')?.touched).toBeTruthy();
    expect(component.patientForm.get('dataNascimento')?.touched).toBeTruthy();
  });

  it('should show error message for invalid birth date', () => {
    const dateInput = fixture.nativeElement.querySelector('#birthDate');
    // For date inputs, we can set an invalid value or just leave it empty if required
    dateInput.value = ''; 
    dateInput.dispatchEvent(new Event('input'));
    dateInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('.error-text');
    expect(errorMsg).toBeTruthy();
  });

  it('should show api error message on 409 Conflict', () => {
    const patientService = TestBed.inject(PatientService);
    (patientService.createPatient as any).mockReturnValue(throwError(() => new Error('Documento já cadastrado.')));

    component.patientForm.patchValue({
      nome: 'João da Silva',
      documento: '123.456.789-01',
      dataNascimento: '1990-01-01'
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.apiError).toBe('Documento já cadastrado.');
    const errorComponent = fixture.nativeElement.querySelector('app-error-message');
    expect(errorComponent).toBeTruthy();
  });

  it('should show "Salvando..." on button when submitting', () => {
    component.isSubmitting = true;
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.textContent).toContain('Salvando...');
    expect(submitBtn.disabled).toBeTruthy();
  });

  it('should be invalid if birth date is in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().split('T')[0];

    component.patientForm.patchValue({
      nome: 'João da Silva',
      documento: '123.456.789-01',
      dataNascimento: dateString
    });
    fixture.detectChanges();

    expect(component.patientForm.get('dataNascimento')?.invalid).toBeTruthy();
    expect(component.patientForm.get('dataNascimento')?.errors?.['zodError']).toContain('Data de nascimento não pode ser no futuro');
  });
});
