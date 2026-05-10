import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, MaxLength, IsDate, IsDateString } from 'class-validator';
import { DicomModality } from '@prisma/client';


export class CreateExamDto {
  @IsUUID('4')
  @IsNotEmpty()
  idempotencyKey: string;

  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsEnum(DicomModality)
  @IsNotEmpty()
  modalidade: DicomModality;

  @IsDateString()
  @IsNotEmpty()
  dataExame: Date;
}
