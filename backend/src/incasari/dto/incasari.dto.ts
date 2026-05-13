import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModalitateIncasare } from '@prisma/client';

export class AlocareIncasareDto {
  @IsNumber()
  idFactura: number;

  @IsNumber()
  @Min(0.01)
  sumaAlocata: number;
}

export class CreateIncasareDto {
  @IsNumber()
  idClient: number;

  @IsNumber()
  @Min(0.01)
  sumaIncasata: number;

  @IsEnum(ModalitateIncasare)
  modalitate: ModalitateIncasare;

  @IsOptional()
  @IsString()
  referinta?: string;

  @IsDateString()
  data: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlocareIncasareDto)
  alocari: AlocareIncasareDto[];
}
