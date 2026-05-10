import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from './exam.service';
import { Exam } from '../models/exam.model';
import { LoadingComponent } from '../shared/loading.component';
import { ErrorMessageComponent } from '../shared/error-message.component';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss'
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  isLoading = false;
  error: string | null = null;
  Math = Math;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  get pages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  constructor(private examService: ExamService) { }

  ngOnInit() {
    this.loadExams();
  }

  loadExams(page: number = 1) {
    this.isLoading = true;
    this.error = null;
    this.currentPage = page;

    this.examService.getExams(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.exams = response.data;
        this.totalPages = response.totalPages;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }
}
