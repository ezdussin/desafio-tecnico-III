import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Patient, PaginatedResponse } from '../models/patient.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) { }

  getPatients(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Patient>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<Patient>>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  createPatient(patientData: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patientData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.status === 409) {
        errorMessage = 'Documento já cadastrado.';
      } else if (error.status === 400) {
        errorMessage = 'Dados inválidos enviados ao servidor.';
      } else if (error.status === 0) {
        errorMessage = 'Erro de rede. O servidor pode estar indisponível.';
      } else {
        errorMessage = `Erro no servidor: ${error.status}\nMensagem: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
