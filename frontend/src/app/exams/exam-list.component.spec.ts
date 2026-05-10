import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamListComponent } from './exam-list.component';
import { ExamService } from './exam.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { vi } from 'vitest';

describe('ExamListComponent', () => {
  let component: ExamListComponent;
  let fixture: ComponentFixture<ExamListComponent>;
  let examService: any;

  beforeEach(async () => {
    const examSpy = { getExams: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        ExamListComponent,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: ExamService, useValue: examSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExamListComponent);
    component = fixture.componentInstance;
    examService = TestBed.inject(ExamService);

    examService.getExams.mockReturnValue(of({ 
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

  it('should render exams list', () => {
    const exams = [
      { 
        id: '1', 
        patient: { nome: 'João' }, 
        modalidade: 'CT', 
        dataExame: '2023-01-01T10:00' 
      }
    ];
    component.isLoading = false;
    component.exams = exams as any;
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('João');
    expect(rows[0].textContent).toContain('CT');
  });

  it('should handle pagination', () => {
    component.totalPages = 2;
    component.totalItems = 15;
    component.currentPage = 1;
    fixture.detectChanges();

    const paginationButtons = fixture.nativeElement.querySelectorAll('.pagination-pages button');
    expect(paginationButtons.length).toBe(2);

    const loadSpy = vi.spyOn(component, 'loadExams');
    paginationButtons[1].click();
    expect(loadSpy).toHaveBeenCalledWith(2);
  });
});
