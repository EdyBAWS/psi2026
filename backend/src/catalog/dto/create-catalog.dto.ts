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

import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

export class CreateKitItemDto {
  @IsNumber()
  idPiesa: number;

  @IsNumber()
  @Min(1)
  cantitate: number;
}

export class CreateKitDto {
  @IsString()
  codKit: string;

  @IsString()
  denumire: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reducere?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKitItemDto)
  piese: CreateKitItemDto[];
}
