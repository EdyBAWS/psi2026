import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFacturaItemDto {
  @IsString()
  descriere: string;

  @IsNumber()
  cantitate: number;

  @IsNumber()
  pretUnitar: number;

  @IsOptional()
  @IsNumber()
  idPiesa?: number;

  @IsOptional()
  @IsNumber()
  idManopera?: number;
}

export class CreateFacturareDto {
  @IsNumber()
  numar: number;

  @IsOptional()
  @IsString()
  serie?: string;

  @IsNumber()
  idClient: number;

  @IsDateString()
  scadenta: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacturaItemDto)
  iteme: CreateFacturaItemDto[];
}
