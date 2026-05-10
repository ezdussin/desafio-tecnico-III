import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Exam } from '../models/exam.model';
import { PaginatedResponse } from '../models/patient.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = `${environment.apiUrl}/exames`;

  constructor(private http: HttpClient) { }

  getExams(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Exam>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<Exam>>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  createExam(examData: Partial<Exam>): Observable<Exam> {
    return this.http.post<Exam>(this.apiUrl, examData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.status === 400) {
        errorMessage = 'Dados inválidos ou Paciente não encontrado.';
      } else if (error.status === 0) {
        errorMessage = 'Erro de rede. O servidor pode estar indisponível.';
      } else {
        errorMessage = `Erro no servidor: ${error.status}\nMensagem: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
