import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { StatusGeneral } from '@prisma/client';

export class CreateAsiguratorDto {
  @IsString()
  denumire: string;

  @IsString()
  CUI: string;

  @IsOptional()
  @IsString()
  telefon?: string;

  @IsOptional()
  @IsString()
  nrRegCom?: string;

  @IsOptional()
  @IsString()
  adresa?: string;

  @IsOptional()
  @IsString() // Folosim IsString in loc de IsEmail pt ca poate fi gol
  emailDaune?: string;

  @IsOptional()
  @IsString()
  IBAN?: string;

  @IsOptional()
  @IsNumber()
  termenPlataZile?: number;

  @IsOptional()
  @IsEnum(StatusGeneral)
  status?: StatusGeneral;
}
