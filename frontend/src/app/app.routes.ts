import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
  { path: 'pacientes', loadComponent: () => import('./patients/patient-list.component').then(c => c.PatientListComponent) },
  { path: 'pacientes/novo', loadComponent: () => import('./patients/patient-form.component').then(c => c.PatientFormComponent) },
  { path: 'exames', loadComponent: () => import('./exams/exam-list.component').then(c => c.ExamListComponent) },
  { path: 'exames/novo', loadComponent: () => import('./exams/exam-form.component').then(c => c.ExamFormComponent) }
];
