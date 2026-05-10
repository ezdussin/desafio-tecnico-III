import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PatientService } from './patient.service';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get patients with pagination', () => {
    const mockResponse = {
      data: [{ id: '1', nome: 'Test', documento: '123', dataNascimento: '1990-01-01' }],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1
    };

    service.getPatients(1, 10).subscribe(response => {
      expect(response.data.length).toBe(1);
      expect(response.total).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/pacientes?page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle conflict error (409)', () => {
    service.createPatient({ documento: '12312312312' }).subscribe({
      next: () => expect.fail('should have failed with 409 error'),
      error: (error) => {
        expect(error.message).toContain('Documento já cadastrado');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/pacientes`);
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });
  });
});
