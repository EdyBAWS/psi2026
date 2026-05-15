import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { StatusGeneral, TipAngajat, TipClient } from '@prisma/client';

export class CreateClientDto {
  @IsEnum(TipClient)
  tipClient: TipClient;

  @IsOptional()
  @IsEnum(StatusGeneral)
  status?: StatusGeneral;

  @IsString()
  nume: string;

  @IsOptional()
  @IsString()
  prenume?: string;

  @IsString()
  telefon: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  adresa: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  soldDebitor?: number;

  @IsOptional()
  @IsString()
  CNP?: string;

  @IsOptional()
  @IsString()
  serieCI?: string;

  @IsOptional()
  @IsString()
  CUI?: string;

  @IsOptional()
  @IsString()
  IBAN?: string;

  @IsOptional()
  @IsString()
  nrRegCom?: string;
}

export class CreateAngajatDto {
  @IsOptional()
  @IsEnum(StatusGeneral)
  status?: StatusGeneral;

  @IsString()
  nume: string;

  @IsString()
  prenume: string;

  @IsString()
  CNP: string;

  @IsString()
  telefon: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsEnum(TipAngajat)
  tipAngajat: TipAngajat;

  @IsOptional()
  @IsBoolean()
  esteInspector?: boolean;

  @IsOptional()
  @IsString()
  specializare?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costOrar?: number;

  @IsOptional()
  @IsString()
  departament?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sporConducere?: number;

  @IsOptional()
  @IsString()
  nrBirou?: string;

  @IsOptional()
  @IsString()
  tura?: string;
}

export class CreateAsiguratorDto {
  @IsString()
  denumire: string;

  @IsString()
  CUI: string;

  @IsString()
  telefon: string;

  @IsOptional()
  @IsString()
  nrRegCom?: string;

  @IsOptional()
  @IsString()
  adresa?: string;

  @IsOptional()
  @IsString()
  emailDaune?: string;

  @IsOptional()
  @IsString()
  IBAN?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  termenPlataZile?: number;

  @IsOptional()
  @IsEnum(StatusGeneral)
  status?: StatusGeneral;
}
