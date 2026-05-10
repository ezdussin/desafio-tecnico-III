import { Patient } from './patient.model';

export type DicomModality = 'CR' | 'CT' | 'DX' | 'MG' | 'MR' | 'NM' | 'OT' | 'PT' | 'RF' | 'US' | 'XA';

export const DICOM_MODALITIES: DicomModality[] = [
  'CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'
];

export const DICOM_MODALITIES_LABELS = {
  CR: 'Radiografia Convencional',
  CT: 'Tomografia Computadorizada',
  DX: 'Radiografia Digital',
  MG: 'Mamografia',
  MR: 'Ressonância Magnética',
  NM: 'Medicina Nuclear',
  OT: 'Outro',
  PT: 'Tomografia por Emissão de Pósitrons',
  RF: 'Radiografia Fluoroscopia',
  US: 'Ultrassonografia',
  XA: 'Angiografia'
};

export interface Exam {
  id: string;
  idempotencyKey: string;
  patientId: string;
  modalidade: DicomModality;
  dataExame: string;
  patient: Patient;
  createdAt?: string;
  updatedAt?: string;
}
