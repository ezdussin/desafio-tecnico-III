import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExamService } from './exam.service';
import { environment } from '../../environments/environment';

describe('ExamService', () => {
  let service: ExamService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExamService]
    });
    service = TestBed.inject(ExamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create an exam', () => {
    const examData = { idempotencyKey: 'test-uuid', patientId: 'p1', modalidade: 'CT' as any, dataExame: '2023-01-01' };
    
    service.createExam(examData).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/exames`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.idempotencyKey).toBe('test-uuid');
    req.flush({ id: 'e1', ...examData });
  });

  it('should get exams with pagination', () => {
    const mockResponse = {
      data: [{ id: 'e1', patientId: 'p1', modalidade: 'CT', dataExame: '2023-01-01' }],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1
    };

    service.getExams(1, 10).subscribe(response => {
      expect(response.data.length).toBe(1);
      expect(response.total).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/exames?page=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
