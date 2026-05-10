import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientListComponent } from './patient-list.component';
import { PatientService } from './patient.service';
import { of, throwError } from 'rxjs';
import { RouterModule } from '@angular/router';
import { vi } from 'vitest';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let patientService: any;

  beforeEach(async () => {
    const patientSpy = { getPatients: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        PatientListComponent,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: PatientService, useValue: patientSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    patientService = TestBed.inject(PatientService);

    patientService.getPatients.mockReturnValue(of({ 
      data: [], 
      total: 0, 
      page: 1, 
      pageSize: 10, 
      totalPages: 0 
    }));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading component while loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const loading = fixture.nativeElement.querySelector('app-loading');
    expect(loading).toBeTruthy();
  });

  it('should show error message and retry button on failure', () => {
    component.isLoading = false;
    component.error = 'Network Error';
    fixture.detectChanges();

    const errorComponent = fixture.nativeElement.querySelector('app-error-message');
    expect(errorComponent).toBeTruthy();
    
    // Test retry
    const retrySpy = vi.spyOn(component, 'loadPatients');
    const errorComp = fixture.debugElement.query(el => el.name === 'app-error-message').componentInstance;
    errorComp.retry.emit();
    expect(retrySpy).toHaveBeenCalled();
  });

  it('should render patients list', () => {
    const patients = [
      { id: '1', nome: 'João', documento: '12312312312', dataNascimento: '1990-01-01' },
      { id: '2', nome: 'Maria', documento: '32132132132', dataNascimento: '1995-05-05' }
    ];
    component.isLoading = false;
    component.patients = patients;
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('João');
    expect(rows[1].textContent).toContain('Maria');
  });

  it('should handle pagination', () => {
    component.totalPages = 3;
    component.totalItems = 25;
    component.currentPage = 1;
    fixture.detectChanges();

    const paginationButtons = fixture.nativeElement.querySelectorAll('.pagination-pages button');
    expect(paginationButtons.length).toBe(3);

    const loadSpy = vi.spyOn(component, 'loadPatients');
    paginationButtons[1].click();
    expect(loadSpy).toHaveBeenCalledWith(2);
  });
});
