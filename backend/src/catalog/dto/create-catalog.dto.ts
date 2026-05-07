import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TipPiesa } from '@prisma/client';

export class CreatePiesaDto {
  @IsString()
  codPiesa: string;

  @IsString()
  denumire: string;

  @IsString()
  producator: string;

  @IsString()
  categorie: string;

  @IsNumber()
  @Min(0)
  pretBaza: number;

  @IsNumber()
  @Min(0)
  stoc: number;

  @IsEnum(TipPiesa)
  tip: TipPiesa;

  @IsOptional()
  @IsNumber()
  @Min(0)
  luniGarantie?: number;

  @IsOptional()
  @IsString()
  gradUzura?: string;
}

export class CreateManoperaDto {
  @IsString()
  codManopera: string;

  @IsString()
  denumire: string;

  @IsString()
  categorie: string;

  @IsNumber()
  @Min(0)
  durataStd: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pretOra?: number;
}
