import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { TipNotificare } from '@prisma/client';

export class CreateNotificareDto {
  @IsString()
  mesaj: string;

  @IsOptional()
  @IsEnum(TipNotificare)
  tip?: TipNotificare;

  @IsOptional()
  @IsString()
  paginaDestinatie?: string;

  @IsOptional()
  @IsString()
  sursaModul?: string;

  @IsOptional()
  @IsString()
  textActiune?: string;

  @IsOptional()
  @IsNumber()
  idFactura?: number;

  @IsOptional()
  @IsNumber()
  idComanda?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateNotificareDto {
  @IsOptional()
  @IsBoolean()
  citit?: boolean;

  @IsOptional()
  @IsBoolean()
  arhivata?: boolean;

  @IsOptional()
  @IsBoolean()
  stearsa?: boolean;
}
