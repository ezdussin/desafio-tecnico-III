import { IsString, IsNotEmpty, MinLength, MaxLength, IsISO8601, Matches } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'documento deve conter exatamente 11 números' })
  documento: string;

  @IsISO8601()
  @IsNotEmpty()
  dataNascimento: string;
}
